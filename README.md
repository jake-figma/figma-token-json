# figma-token-json
A JSON representation for Figma Variables following the [W3C Tokens spec](https://github.com/design-tokens/community-group)

## Overview

Figma variable collections are merged into a single JSON file to support cross-collection aliasing. Each collection is numerically represented incrementally (0, 1, 2, etc) at the root of the JSON object. Example of how you would model two collections, "primitive" and, "semantic" where the semantic has two modes "Light" and "Dark":


```json
{
  "0": {
    "$extensions": {
      "com.figma": {
        "collectionId": "VariableCollectionId:0:1",
        "fileId": "012340123401234",
        "type": "collection",
        "name": "Primitives: Color",
        "modes": ["Default"]
      }
    },
    "color": {
      "$type": "color",
      "red-300": { "$value": "#C00" },
      "red-500": { "$value": "#F00" }
    }
  },
  "1": {
    "$extensions": {
      "com.figma": {
        "collectionId": "VariableCollectionId:0:2",
        "fileId": "012340123401234",
        "type": "collection",
        "name": "Semantic: Color",
        "modes": ["Light", "Dark"]
      }
    },
    "color": {
      "$type": "color",
      "danger": {
        "$value": "{0.color.red-300}",
        "$extensions": {
          "com.figma": {
            "modes": ["{0.color.red-300}", "{0.color.red-500}"]
          }
        }
      }
    }
  }
}
```

[`$extensions`](https://tr.designtokens.org/format/#extensions-0) is used to describe Figma modes and Figma metadata.
