import { DirTreeElement, DirTreeNode, DirTree } from './main-files';

export function removeBySubpath(paths: DirTreeElement[], subPath: string): DirTreeElement[] {
  paths = paths.filter((element) => {
    return element.path !== subPath;
  });
  return paths;
}

export function deleteNodeAndPaths(root: DirTree, parentPath: string) {
  const dirs = parentPath.split('/');
  let currentNode = root.tree[0];
  if (dirs.length > 1) {
    for (let i = 0; i < dirs.length - 1; i++) {
      const dir = dirs[i];
      for (let j = 0; j < currentNode.children.length; j++) {
        const child = currentNode.children[j];
        if (child.name === dir) {
          currentNode = child;
          break;
        }
      }
    }
  }
  currentNode.children = currentNode.children.filter((child) => { return child.name !== dirs[dirs.length - 1] });
  root.paths = removeBySubpath(root.paths, parentPath);
}

export function insertUpdatedNode(root: DirTree, parentPath: string, parentNode: DirTreeNode) {
  const dirs = parentPath.split('/');
  let currentNode = root.tree[0];
  if (dirs.length > 1) {
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      for (let j = 0; j < currentNode.children.length; j++) {
        const child = currentNode.children[j];
        if (child.name === dir) {
          currentNode = child;
          break;
        }
      }
    }
  }
  if (!currentNode.children) {
    currentNode.children = [];
  }
  let exists = false;
  for (let i = 0; i < currentNode.children.length; i++) {
    const element = currentNode.children[i];
    if (element.name === parentNode.name) {
      exists = true;
      if (element.children) {
        for (let j = 0; j < element.children.length; j++) {
          const child = element.children[j];
          for (let k = 0; k < parentNode.children.length; k++) {
            const parentChild = parentNode.children[k];
            if (child.name === parentChild.name) {
              parentNode.children[k] = child;
              console.log('found matching child %s', child.name);
            }
          }
        }
      }
      currentNode.children[i] = parentNode;
      break;
    }
  }
  if (!exists) {
    if (currentNode === root.tree[0]) {
      parentNode.name = 'root';
      const element = root.tree[0];
      if (element.children) {
        for (let j = 0; j < element.children.length; j++) {
          const child = element.children[j];
          for (let k = 0; k < parentNode.children.length; k++) {
            const parentChild = parentNode.children[k];
            if (child.name === parentChild.name) {
              parentNode.children[k] = child;
              console.log('found matching root child %s', child.name);
            }
          }
        }
      }
      root.tree[0] = parentNode;
    } else {
      currentNode.children.push(parentNode);
    }
  }
}
