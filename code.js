const KEY_PREFIX_COLLECTION = `@`;
const NAMESPACE = "org.example";

exportToJSON();

function exportToJSON() {
  const collections = figma.variables.getLocalVariableCollections();
  const object = {};
  const { idToKey } = uniqueKeyIdMaps(collections, "id", KEY_PREFIX_COLLECTION);

  collections.forEach(
    (collection) =>
      (object[idToKey[collection.id]] = collectionAsJSON(idToKey, collection))
  );

  figma.showUI(
    `<pre style="font-size: 8px">${JSON.stringify(object, null, 2)}</pre>`,
    {
      width: 500,
      height: 700,
    }
  );
}

function collectionAsJSON(collectionIdToKeyMap, { modes, variableIds }) {
  const collection = {};
  const { idToKey, keyToId } = uniqueKeyIdMaps(modes, "modeId");
  const modeKeys = Object.values(idToKey);
  if (modeKeys.length > 1) {
    collection.$extensions = { [NAMESPACE]: { modes: modeKeys } };
  }
  variableIds.forEach((variableId) => {
    const { name, resolvedType, valuesByMode } =
      figma.variables.getVariableById(variableId);
    const value = valuesByMode[keyToId[modeKeys[0]]];
    if (value !== undefined && ["COLOR", "FLOAT"].includes(resolvedType)) {
      let obj = collection;
      name.split("/").forEach((groupName) => {
        obj[groupName] = obj[groupName] || {};
        obj = obj[groupName];
      });
      obj.$type = resolvedType === "COLOR" ? "color" : "number";
      obj.$value = valueToJSON(value, resolvedType, collectionIdToKeyMap);
      if (modeKeys.length > 1) {
        obj.$extensions = {
          [NAMESPACE]: {
            modes: modeKeys.reduce((into, modeKey) => {
              into[modeKey] = valueToJSON(
                valuesByMode[keyToId[modeKey]],
                resolvedType,
                collectionIdToKeyMap
              );
              return into;
            }, {}),
          },
        };
      }
    }
  });
  return collection;
}

function valueToJSON(value, resolvedType, collectionIdToKeyMap) {
  if (value.type === "VARIABLE_ALIAS") {
    const variable = figma.variables.getVariableById(value.id);
    const prefix = collectionIdToKeyMap[variable.variableCollectionId];
    return `{${prefix}_${variable.name.replace(/\//g, ".")}}`;
  }
  return resolvedType === "COLOR" ? rgbToHex(value) : value;
}

function uniqueKeyIdMaps(nodesWithNames, idKey, prefix = "") {
  const idToKey = {};
  const keyToId = {};
  nodesWithNames.forEach((node) => {
    const key = sanitizeName(node.name);
    let int = 2;
    let uniqueKey = `${prefix}${key}`;
    while (keyToId[uniqueKey]) {
      uniqueKey = `${prefix}${key}_${int}`;
      int++;
    }
    keyToId[uniqueKey] = node[idKey];
    idToKey[node[idKey]] = uniqueKey;
  });
  return { idToKey, keyToId };
}

function sanitizeName(name) {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/^ +/, "")
    .replace(/ +$/, "")
    .replace(/ +/g, "_")
    .toLowerCase();
}

function rgbToHex({ r, g, b, a }) {
  if (a !== 1) {
    return `rgba(${[r, g, b]
      .map((n) => Math.round(n * 255))
      .join(", ")}, ${a.toFixed(4)})`;
  }
  const toHex = (value) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join("");
  return `#${hex}`;
}
