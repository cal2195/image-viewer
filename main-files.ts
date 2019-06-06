import { removeBySubpath, insertUpdatedNode, deleteNodeAndPaths, updateMoveFolderHistory, clearSubHistory, addSubHistory } from './main-shared';
import { MoveFolderEvent } from './src/app/move-folder/move-folder.component';

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const async = require('async');
const _ = require('underscore');
const sizeOf = require('image-size');

export interface DirTree {
  rootPath: string;
  cachePath: string;
  paths: DirTreeElement[];
  tree: [DirTreeNode];
  moveRootFolderHistory: string[];
  moveSubFolderHistory: string[];
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
  folder: boolean;
  name: string;
  nameTags: string;
  path: string;
  hash: string;
  next?: DirTreeElement;
  prev?: DirTreeElement;
  tags?: string;
  dimensions?: ImageSize;
  size?: string;
  orientation?: string;
}

export interface ImageSize {
  width: number;
  height: number;
}

export const imageRegex = /(.jpg|.jpeg|.png|.gif)$/;

const homedir = require('os').homedir();
const cachePath = homedir + '/.imageviewer/';

let root: DirTree;
let thumbQueue = async.queue((task, callback) => {
  console.log('starting %s', task);
  generateThumbnail(task.filePath, task.hash, callback);
}, 4);
let dirQueue = async.queue((task, callback) => {
  readDir(task.subPath, task.recursive, task.updateNodeCallback, task.thumbUpdateCallback, callback);
}, 8);

export function initDir(rootDir: string, updateRootCallback: any) {
  try {
    fs.mkdirSync(cachePath);
  } catch (e) {}
  root = { rootPath: rootDir, cachePath: cachePath,
    paths: [], tree: [{ id: '', name: 'root', path: '', children: [], isExpanded: true }],
    moveRootFolderHistory: [rootDir],
    moveSubFolderHistory: [] };
  updateRootCallback(root);
}

export function cancelCurrent() {
  console.log('cancelling current!!!!!!');
  thumbQueue.remove((dontcare) => {return true;});
  dirQueue.remove((dontcare) => {return true;});
}

export function queueReadDir(subPath: string, recursive: boolean, updateNodeCallback: any, thumbUpdateCallback: any) {
  const task = {subPath: subPath, recursive: recursive, updateNodeCallback: updateNodeCallback, thumbUpdateCallback: thumbUpdateCallback};
  dirQueue.unshift(task, () => {});
}

function insertMetadata(entry: DirTreeElement, callback: any) {
  insertTags(entry, (taggedEntry) => {
    insertSize(taggedEntry, (sizedEntry) => {
      callback(null, sizedEntry);
    });
  });
}

function insertTags(entry: DirTreeElement, callback: any) {
  if (entry.tags) {
    return callback(entry);
  }

  const filePath = root.rootPath + entry.path + '/' + entry.name;
  try {
    console.log('inserting tags for %s', entry.name);
    fs.readFile(filePath + '.tags', 'utf8', (err, data) => {
      if (!err) {
        entry.tags = data;
      }
      callback(entry);
    });
  } catch (e) {
    console.log(e);
    callback(entry);
  }
}

function insertSize(entry: DirTreeElement, callback: any) {
  if (entry.dimensions) {
    return callback(entry);
  }

  const filePath = root.rootPath + entry.path + '/' + entry.name;
  console.log('inserting size for %s', entry.name);
  sizeOf(filePath, function (err, dimensions) {
    if (err) {
      console.log(err);
    } else {
      console.log('got size: %dx%d', dimensions.width, dimensions.height);
      entry.dimensions = { width: dimensions.width, height: dimensions.height };
      entry.size = dimensionsToSize(entry.dimensions);
      entry.orientation = dimensionsToOrientation(entry.dimensions);
    }
    callback(entry);
  });
}

export enum IMAGE_SIZE {
  TINY = 300000,
  SMALL = 800000,
  LARGE = 2000000
}

function dimensionsToSize(dimensions: ImageSize) {
  const imageMegapixels = dimensions.width * dimensions.height;
  if (imageMegapixels <= IMAGE_SIZE.TINY) {
    return 'size:little/tiny';
  }
  if (imageMegapixels <= IMAGE_SIZE.SMALL) {
    return 'size:little/small';
  }
  if (imageMegapixels <= IMAGE_SIZE.LARGE) {
    return 'size:big/large';
  }
  return 'size:big/huge';
}

function dimensionsToOrientation(dimensions: ImageSize) {
  if (dimensions.width === dimensions.height) {
    return 'orientation:square';
  }
  if (dimensions.width > dimensions.height) {
    return 'orientation:landscape';
  }
  return 'orientation:portrait';
}

export function readDir(subPath: string, recursive: boolean, updateNodeCallback: any, thumbUpdateCallback: any, queueCallback: any) {
  console.log('reading dir: %s', path.join(root.rootPath, subPath));
  const dirs = subPath.split('/');
  const parentName = dirs[dirs.length - 1];
  const parentPath = dirs.slice(0, dirs.length - 1).join('/');
  const parentNode: DirTreeNode = { id: subPath, name: parentName, path: parentPath };
  const toGetTags = [];
  const paths = [];

  fs.readdir(path.join(root.rootPath, subPath), {encoding: 'utf8', withFileTypes: true}, (err, files) => {
    if (err) {
      console.log(err);
      // call refresh?
      queueCallback();
      return;
    }
    console.log('READ dir: %s', path.join(root.rootPath, subPath));
    parentNode.children = [];

    // tslint:disable-next-line:forin
    files.reverse().forEach(file => {
      if (file.isFile() && !file.name.toLowerCase().match(imageRegex)) {
        return;
      }
      const entry = root.paths.find((value) => { return value.path === subPath && value.name === file.name; }) || {
        folder: file.isDirectory(),
        name: file.name,
        nameTags: (file.name.match(/[A-Za-z']+/g) || []).join(' ').toLowerCase(),
        path: subPath,
        hash: hashString(subPath.substring(subPath.lastIndexOf('/')) + '/' + file.name)
      };
      paths.push(entry);
      if (file.isFile()) {
        toGetTags.push((callback) => {
          insertMetadata(entry, callback);
        });
      }

      // gen thumbs
      if (file.isFile() && file.name.toLowerCase().match(imageRegex)) {
        fs.access(root.cachePath + entry.hash + '.jpg', fs.constants.F_OK, (notExists) => {
          if (notExists) {
            console.log('queueing %s', file.name);
            thumbQueue.unshift({ filePath: root.rootPath + subPath + '/' + file.name, hash: entry.hash },
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
      }
    });
    updateNodeCallback(parentPath, parentNode, paths);
    async.parallelLimit(toGetTags, 8, (err, paths) => {
      parentNode.children = _.sortBy(parentNode.children, (child) => {return child.name});
      updateNodeCallback(parentPath, parentNode, paths);
    });
    queueCallback();
  });
}

export function updateLocalRoot(parentPath: string, parentNode: DirTreeNode, paths: DirTreeElement[]) {
  root.paths = removeBySubpath(root.paths, parentPath + '/' + parentNode.name);
  root.paths = root.paths.concat(paths);
  insertUpdatedNode(root, parentPath, parentNode);
}

function hashString(str: string): string {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return hash;
}

const ffmpegPath = "ffmpeg";//require('@ffmpeg-installer/ffmpeg').path;
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

export function writeRootToDisk(callback: any) {
  const json = JSON.stringify(root);
  fs.writeFile(cachePath + '/cached.dir', json, 'utf8', callback);
}

export function readDiskToRoot(callback: any) {
  fs.readFile(cachePath + '/cached.dir', (err, data) => {
    if (err) {
      callback();
    } else {
      root = JSON.parse(data);
      callback(root);
    }
  });
}

export function markForDelete(path: string, file: string) {
  try {
    fs.renameSync(root.rootPath + '/' + path + '/' + file, root.rootPath + '/' + path + '/.delete_' + file);
    deleteNodeAndPaths(root, path + '/' + file);
  } catch (e) {
    console.log(e);
  }
}

export function moveFolder(oldPath: string, moveEvent: MoveFolderEvent, file: string) {
  try {
    fs.mkdirpSync(moveEvent.rootFolder + '/' + moveEvent.subFolder);
    fs.renameSync(root.rootPath + '/' + oldPath + '/' + file, moveEvent.rootFolder + '/' + moveEvent.subFolder + '/' + file);
    deleteNodeAndPaths(root, oldPath + '/' + file);
    updateMoveFolderHistory(root, moveEvent);
  } catch (e) {
    console.log(e);
  }
}

const klaw = require('klaw')
const through2 = require('through2');

const excludeFileFilter = through2.obj(function (item, enc, next) {
  if (item.stats.isDirectory()) {
    this.push(item);
  }
  next();
});

export function genereateMoveTree(rootPath: string, newDir: any) {
  clearSubHistory(root);
  klaw(rootPath)
  .pipe(excludeFileFilter)
  .on('data', item => {
    const dir = item.path.substring(rootPath.length, item.path.lastIndexOf('/'));
    if (dir === '' || item.path === rootPath) {
      return;
    }
    console.log('found %s from %s with root %s', dir, item.path, rootPath);
    addSubHistory(root, dir);
    newDir(dir);
  });
}
