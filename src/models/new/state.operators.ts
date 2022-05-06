import produce from "immer";
import { StateOperator } from "@ngxs/store";
import { Record, DataTypes, Interface } from "./data.interfaces";
import { getOriginalName } from "./data.mapper";

type RepresentedType<K extends DataTypes, V extends keyof Interface<K>> =
  Interface<K>[V];

namespace mutable {
  export function addDataField(draft: any, target: DataTypes, fields: string[]) {
    (draft.fields || (draft.fields = {}))[target] = fields;
  };

  export function addValues(draft: any, target: DataTypes, values: Record<any>) {
    const record = draft[target] || (draft[target] = {});
    for ( let key of Object.keys(values) )
      record[key] = values[key];
  };

  export function deleteIds(draft: any, target: DataTypes, ids: number[]) {
    const record = draft[target] || {},
      currentIds = Object.keys(record).map(id => +id);
    
    for ( let id of currentIds )
      if ( ids.includes(id) )
        delete record[id];
  };

  //configure type so this can only be called on complex types
  export function update(draft: any, target: DataTypes, values: Record<any>) {
    console.log("target", target, values)
    const targetObjects = draft[target],
      fields = draft.fields[target];
    
    //translate data
    Object.entries<any>(values).forEach(([id, item]) => {
      console.log("update", id, item)
      const current = targetObjects[id];
      //if not created create
      if ( !current ) {
        
        if (typeof(item) != 'string') {
          for ( let i = 0; i < item.length; i++ ) {
            if ( typeof item[i] == 'object' ) {
              mutable.update(draft, fields[i], item[i]);
              item[i] = Object.keys(item[i]).map(id => +id);
            }
          }
        }
      // else update
      } else {
        if (typeof(item) != 'string') {
          for ( let i = 0; i < current.length; i++ ) {
            //special treatement for arrays
            if ( Array.isArray(current[i]) ) {
              if ( current[i].length ) {
                mutable.deleteIds(draft, fields[i], current[i]);
              }
              mutable.update(draft, fields[i], item[i]);
              if (fields[i] != "DatePost") {
                item[i] = Object.keys(item[i]).map(id => +id);
              }
            }
          }
        }
      }
    });
    
    mutable.addValues(draft, target, values);
  }

  //assumes old and rep and unique whitin themselves
  function removeDuplicates(draft: any, target: DataTypes, old: number[], rep: number[], uniqueIndex: number) {
    const objects = draft[target],
      deletedIds: number[] = [];

    
    newList: for ( const newId of rep ) {
      for ( const oldId of old ) {
        if ( objects[newId][uniqueIndex] == objects[oldId][uniqueIndex] ) {
          deletedIds.push(oldId);
          //continue newList;
        }
      }
    }
    
    mutable.deleteIds(draft, target, deletedIds);
    return old.filter(id => !deletedIds.includes(id));
  }

  //configure to only accept simple types
  //can create new items and add them to parent
  export function addSimpleChildren<K extends DataTypes>(draft: any, parent: DataTypes, parentId: number, child: K, values: Record<any>, uniqueBy?: keyof Interface<K>) {
    //Add children
    const ids = Object.keys(values).map(id => +id);

    //add to parent
    const parentObject = draft[parent]?.[parentId],
      childIndex = draft.fields[parent].indexOf(child);
    if ( !parentObject || childIndex <= -1 ) return;

    mutable.addValues(draft, child, values);
    //don't count overwritten ids
    const oldIds = parentObject[childIndex].filter((id: number) => !ids.includes(id));

    if ( uniqueBy ) {
      const uniqueIndex = draft.fields[child].indexOf(uniqueBy);
      if ( uniqueIndex !== void 0 )
        parentObject[childIndex] = removeDuplicates(draft, child, oldIds, ids, uniqueIndex);
    }

    for ( const id of ids )
      if ( !parentObject[childIndex].includes(id) )
        parentObject[childIndex].push(id);
  }

  //configure to only accept complex data types
  //does an update on child and supplies parent with the ids
  //can create new items
  //deep alternative to pushChildValues
  export function addComplexChildren<K extends DataTypes>(draft: any, parent: DataTypes, parentId: number, child: K, values: Record<any>, uniqueBy?: keyof Interface<K>) {
    //Add children
    mutable.update(draft, child, values);
    const ids = Object.keys(values).map(id => +id);

    //add to parent
    const parentObject = draft[parent]?.[parentId],
      childIndex = draft.fields[parent].indexOf(child);
    
    if ( !parentObject || childIndex <= -1 ) return;
    
    for ( const id of ids )
      if ( !parentObject[childIndex].includes(id) )
        parentObject[childIndex].push(id);
  }

  export function replaceChildren<K extends DataTypes>(draft: any, parent: DataTypes, parentId: number, child: K, values: Record<any>) {
    const parentObject = draft[parent]?.[parentId],
      childIndex = draft.fields[parent].indexOf(child);
    
    if ( !parentObject || childIndex <= -1 ) return;
    mutable.deleteIds(draft, child, parentObject[childIndex]);
    mutable.addValues(draft, child, values);
    parentObject[childIndex] = Object.keys(values).map(id => +id);
  }

  export function transformField<K extends DataTypes, V extends keyof Interface<K>>(draft: any, target: K, id: number, field: V, transform: (value: RepresentedType<K, V>, object: any[], fields: string[]) => RepresentedType<K, V>) {
    const fields = draft.fields,
      targetObject = draft[target][id];
    
    let fieldIndex = fields[target].indexOf(getOriginalName(field as string));
    if ( !targetObject ) return;
    targetObject[fieldIndex] = transform(targetObject[fieldIndex], targetObject, fields);
  }
};

//use immer to makes changes immutable
export function compose<T>(...operators: StateOperator<T>[]): StateOperator<T> {
  return function(existing: Readonly<T>): T {
    let output: T = existing;
    for ( const operator of operators )
      output = operator(output);
    return output;
  };
};

export function addDataField(target: DataTypes, fields: string[]) {
  return produce(draft => mutable.addDataField(draft, target, fields));
};

export function deleteIds(target: DataTypes, ids: number[]) {
  return produce(draft => mutable.deleteIds(draft, target, ids));
};

export function addValues(target: DataTypes, values: Record<any>) {
  return produce(draft => mutable.addValues(draft, target, values));
};

export function addRecord(target: DataTypes, fields: string[], values: Record<any>) {
  return compose(addDataField(target, fields), addValues(target, values));
};

export function update(target: DataTypes, values: any) {
  return produce(draft => mutable.update(draft, target, values));
};

export function addSimpleChildren<K extends DataTypes>(parent: DataTypes, parentId: number, child: K, values: Record<any>, uniqueBy?: keyof Interface<K>) {
  return produce(draft => mutable.addSimpleChildren(draft, parent, parentId, child, values, uniqueBy));
};

export function addComplexChildren<K extends DataTypes>(parent: DataTypes, parentId: number, child: K, values: Record<any>) {
  return produce(draft => mutable.addComplexChildren(draft, parent, parentId, child, values));
};

export function transformField<K extends DataTypes, V extends keyof Interface<K>>(target: K, id: number, field: V, transform: (value: RepresentedType<K, V>, object: any[], fields: string[]) => RepresentedType<K, V>) {
  return produce(draft => mutable.transformField(draft, target, id, field, transform));
};

export function replaceChildren<K extends DataTypes>(parent: DataTypes, parentId: number, child: K, values: Record<any>) {
  return produce(draft => mutable.replaceChildren(draft, parent, parentId, child, values));
};