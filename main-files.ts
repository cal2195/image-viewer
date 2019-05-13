const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

export interface DirTree {
  rootPath: string;
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

export function initDir(rootDir: string) {
  root = { rootPath: rootDir, paths: [], tree: [{ id: '', name: 'root', path: '', children: [], isExpanded: true }] };
}

export function readDir(subPath: string, callback: any) {
  console.log('reading dir: %s', path.join(root.rootPath, subPath));
  fs.readdir(path.join(root.rootPath, subPath), {encoding: 'utf8', withFileTypes: true}, (err, files) => {
    console.log(files);
    console.log(err);
    let updated = false;

    // tslint:disable-next-line:forin
    files.forEach(file => {
      const entry: DirTreeElement = {
        folder: file.isDirectory(),
        name: file.name,
        path: subPath,
        hash: hashString(subPath + '/' + file.name)
      };
      root.paths.push(entry);

      // update tree
      if (file.isDirectory()) {
        const dirs = subPath.split('/');
        let parentNode = root.tree[0];
        if (dirs.length > 1) {
          for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            console.log('looking for %s in %s', dir, parentNode);
            for (let j = 0; j < parentNode.children.length; j++) {
              const child = parentNode.children[j];
              console.log(child);
              if (child.name === dir) {
                parentNode = child;
                console.log('found!');
                break;
              }
            }
          }
        }
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push({ id: subPath + '/' + file.name, name: file.name, path: subPath, hasChildren: true });
        updated = true;
      }
    });

    if (files.length === 0 || !updated) {
      const dirs = subPath.split('/');
      let parentNode = root.tree[0];
      if (dirs.length > 1) {
        for (let i = 0; i < dirs.length; i++) {
          const dir = dirs[i];
          console.log('looking for %s in %s', dir, parentNode);
          for (let j = 0; j < parentNode.children.length; j++) {
            const child = parentNode.children[j];
            console.log(child);
            if (child.name === dir) {
              parentNode = child;
              console.log('found!');
              break;
            }
          }
        }
      }
      parentNode.children = [];
      parentNode.hasChildren = false;
    }
    callback(root);
  });
}

function hashString(str: string): string {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return hash;
}
