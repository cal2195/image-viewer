const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const async = require('async');

export interface DirTree {
  rootPath: string;
  cachePath: string;
  paths: DirTreeElement[];
  tree: [DirTreeNode];
}

export interface DirTreeNode {
  id: string;
  name: string;
  children?: DirTreeNode[];
  hasChildren?: boolean;
  isExpanded?: boolean;
  path: string;
}

export interface DirTreeElement {
  folder: string;
  name: string;
  path: string;
  hash: string;
  next?: DirTreeElement;
  prev?: DirTreeElement;
  tags?: string;
}

export const imageRegex = /(.jpg|.png|.gif)$/;

let root: DirTree;
let thumbQueue = async.queue((task, callback) => {
  console.log('starting %s', task);
  generateThumbnail(task.filePath, task.hash, callback);
}, 2);
let dirQueue = async.queue((task, callback) => {
  readDir(task.subPath, task.recursive, task.updateNodeCallback, task.thumbUpdateCallback);
  callback();
}, 1);

export function initDir(rootDir: string, updateRootCallback: any) {
  const homedir = require('os').homedir();
  const cachePath = homedir + '/.imageviewer/';
  try {
    fs.mkdirSync(cachePath);
  } catch (e) {}
  root = { rootPath: rootDir, cachePath: cachePath,
    paths: [], tree: [{ id: '', name: 'root', path: '', children: [], isExpanded: true }] };
  updateRootCallback(root);
}

export function cancelCurrent() {
  thumbQueue.remove(() => {return true;});
  dirQueue.remove(() => {return true;});
}

export function queueReadDir(subPath: string, recursive: boolean, updateNodeCallback: any, thumbUpdateCallback: any) {
  const task = {subPath: subPath, recursive: recursive, updateNodeCallback: updateNodeCallback, thumbUpdateCallback: thumbUpdateCallback};
  dirQueue.push(task, () => {});
}

function insertTags(entry: DirTreeElement, callback: any) {
  try {
    console.log('inserting tags for %s', entry.name);
    fs.readFile(root.rootPath + entry.path + '/' + entry.name + '.tags', 'utf8', (err, data) => {
      if (!err) {
        entry.tags = data;
      }
      callback(null, entry);
    });
  } catch (e) {
    console.log(e);
    callback(null, entry);
  }
}

export function readDir(subPath: string, recursive: boolean, updateNodeCallback: any, thumbUpdateCallback: any) {
  console.log('reading dir: %s', path.join(root.rootPath, subPath));
  const dirs = subPath.split('/');
  const parentName = dirs[dirs.length - 1];
  const parentPath = dirs.slice(0, dirs.length - 1).join('/');
  const parentNode: DirTreeNode = { id: subPath, name: parentName, path: parentPath };
  const toGetTags = [];

  fs.readdir(path.join(root.rootPath, subPath), {encoding: 'utf8', withFileTypes: true}, (err, files) => {
    if (err) {
      console.log(err);
      // call refresh?
      return;
    }
    console.log('READ dir: %s', path.join(root.rootPath, subPath));
    parentNode.children = [];

    // tslint:disable-next-line:forin
    files.forEach(file => {
      if (file.isFile() && !file.name.match(imageRegex)) {
        return;
      }
      const entry: DirTreeElement = {
        folder: file.isDirectory(),
        name: file.name,
        path: subPath,
        hash: hashString(root.rootPath + subPath + '/' + file.name)
      };
      toGetTags.push((callback) => {
        insertTags(entry, callback);
      });

      // gen thumbs
      if (file.isFile() && file.name.match(imageRegex)) {
        fs.access(root.cachePath + entry.hash + '.jpg', fs.constants.F_OK, (notExists) => {
          if (notExists) {
            console.log('queueing %s', file.name);
            thumbQueue.push({ filePath: root.rootPath + subPath + '/' + file.name, hash: entry.hash },
            function(err) {
                console.log('finished processing foo');
                thumbUpdateCallback(entry.hash);
            });
          }
        });
      }

      // update tree
      if (file.isDirectory() && !file.name.startsWith('.')) {
        parentNode.children.push({ id: subPath + '/' + file.name, name: file.name, path: subPath, hasChildren: true });
        if (recursive) {
          queueReadDir(subPath + '/' + file.name, recursive, updateNodeCallback, thumbUpdateCallback);
        }
        // const dirs = subPath.split('/');
        // let parentNode = root.tree[0];
        // if (dirs.length > 1) {
        //   for (let i = 0; i < dirs.length; i++) {
        //     const dir = dirs[i];
        //     for (let j = 0; j < parentNode.children.length; j++) {
        //       const child = parentNode.children[j];
        //       if (child.name === dir) {
        //         parentNode = child;
        //         break;
        //       }
        //     }
        //   }
        // }
        // if (!parentNode.children) {
        //   parentNode.children = [];
        // }
        // let exists = false;
        // parentNode.children.forEach(element => {
        //   if (element.id === subPath + '/' + file.name) {
        //     exists = true;
        //   }
        // });
        // if (!exists) {
        //   parentNode.children.push({ id: subPath + '/' + file.name, name: file.name, path: subPath, hasChildren: true });
        // }
        // updated = true;
        // if (recursive) {
        //   readDir(subPath + '/' + file.name, recursive, rootUpdateCallback, thumbUpdateCallback);
        // }
      }
    });
    async.series(toGetTags, (err, paths) => {
      updateNodeCallback(parentPath, parentNode, paths);
    });
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
    ffmpegPath + ' -y -i "' + filePath + '" -vf scale=w=240:h=240:force_original_aspect_ratio=decrease "' + root.cachePath + hash + '.jpg"';
  console.log(thumbCommand);
  exec(thumbCommand, (err, data, stderr) => {
    // console.log(err);
    // console.log(data);
    // console.log(stderr);
    callback();
  });
}
