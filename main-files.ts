const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
var async = require("async");

export interface DirTree {
  rootPath: string;
  cachePath: string;
  paths: DirTreeElement[];
  tree: [TreeNode];
}

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  hasChildren?: boolean;
  isExpanded?: boolean;
  path: string;
}

export interface DirTreeElement {
  folder: string;
  name: string;
  path: string;
  hash: string;
}

let root: DirTree;
let thumbQueue = async.queue((task, callback) => {
  console.log('starting %s', task);
  generateThumbnail(task.filePath, task.hash, callback);
}, 2);

export function initDir(rootDir: string) {
  const homedir = require('os').homedir();
  const cachePath = homedir + '/.imageviewer/';
  try {
    fs.mkdirSync(cachePath);
  } catch (e) {}
  root = { rootPath: rootDir, cachePath: cachePath,
    paths: [], tree: [{ id: '', name: 'root', path: '', children: [], isExpanded: true }] };
}

function removeBySubpath(subPath: string) {
  root.paths = root.paths.filter((element) => {
    return element.path !== subPath;
  });
}

export function readDir(subPath: string, recursive: boolean, rootUpdateCallback: any, thumbUpdateCallback: any) {
  console.log('reading dir: %s', path.join(root.rootPath, subPath));
  removeBySubpath(subPath);
  fs.readdir(path.join(root.rootPath, subPath), {encoding: 'utf8', withFileTypes: true}, (err, files) => {
    console.log(err);
    let updated = false;

    // tslint:disable-next-line:forin
    files.forEach(file => {
      const entry: DirTreeElement = {
        folder: file.isDirectory(),
        name: file.name,
        path: subPath,
        hash: hashString(root.rootPath + subPath + '/' + file.name)
      };
      root.paths.push(entry);

      // gen thumbs
      if (file.isFile() && file.name.endsWith('.jpg')) {
        fs.access(root.cachePath + entry.hash + '.jpg', fs.constants.F_OK, (notExists) => {
          if (notExists) {
            console.log('queueing %s', file.name);
            thumbQueue.push({ filePath: root.rootPath + subPath + '/' + file.name, hash: entry.hash },
            function(err) {
                console.log('finished processing foo');
                console.log(err);
                thumbUpdateCallback(entry.hash);
            });
          }
        });
      }

      // update tree
      if (file.isDirectory() && !file.name.startsWith('.')) {
        const dirs = subPath.split('/');
        let parentNode = root.tree[0];
        if (dirs.length > 1) {
          for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            for (let j = 0; j < parentNode.children.length; j++) {
              const child = parentNode.children[j];
              if (child.name === dir) {
                parentNode = child;
                break;
              }
            }
          }
        }
        if (!parentNode.children) {
          parentNode.children = [];
        }
        let exists = false;
        parentNode.children.forEach(element => {
          if (element.id === subPath + '/' + file.name) {
            exists = true;
          }
        });
        if (!exists) {
          parentNode.children.push({ id: subPath + '/' + file.name, name: file.name, path: subPath, hasChildren: true });
        }
        updated = true;
        if (recursive) {
          readDir(subPath + '/' + file.name, recursive, rootUpdateCallback, thumbUpdateCallback);
        }
      }
    });

    if (files.length === 0 || !updated) {
      const dirs = subPath.split('/');
      let parentNode = root.tree[0];
      if (dirs.length > 1) {
        for (let i = 0; i < dirs.length; i++) {
          const dir = dirs[i];
          for (let j = 0; j < parentNode.children.length; j++) {
            const child = parentNode.children[j];
            if (child.name === dir) {
              parentNode = child;
              break;
            }
          }
        }
      }
      parentNode.children = [];
      parentNode.hasChildren = false;
    }
    rootUpdateCallback(root);
  });
}

function hashString(str: string): string {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return hash;
}

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
// sends data back as a stream as process runs
// requires an array of args
const spawn = require('child_process').spawn;
// sends all data back once the process exits in a buffer
// also spawns a shell (can pass a single cmd string)
const exec = require('child_process').exec;

function generateThumbnail(filePath: string, hash: string, callback) {
  const thumbCommand =
    'ffmpeg -y -i "' + filePath + '" -vf scale=w=240:h=240:force_original_aspect_ratio=decrease "' + root.cachePath + hash + '.jpg"';
  console.log(thumbCommand);
  exec(thumbCommand, (err, data, stderr) => {
    // console.log(err);
    // console.log(data);
    // console.log(stderr);
    callback();
  });
}
