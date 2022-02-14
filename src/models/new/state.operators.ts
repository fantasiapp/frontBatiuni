import { StateOperator } from "@ngxs/store";
import produce from "immer";
import { Record, DataTypes, Interface } from "./data.interfaces";
import { getOriginalName, NameMapping } from "./data.mapper";

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
    const record = draft[target] || {};
    for ( let id of Object.keys(record) )
      if ( ids.includes(+id) )
        delete draft[record];
  };

  export function replace(draft: any, target: DataTypes, values: Record<any>) {
    const targetObjects = draft[target],
      fields = draft.fields[target];

  
    //translate data
    Object.entries<any>(values).forEach(([id, item]) => {
      const current = targetObjects[id];
      if ( !current ) return; //nothing to be done
      for ( let i = 0; i < current.length; i++ ) {
        //special treatement for arrays
        if ( Array.isArray(current[i]) ) {
          if ( current[i].length )
            mutable.deleteIds(draft, fields[i], current[i]);
          
          const keys = Object.keys(item[i]);
          if ( keys.length )
            mutable.addValues(draft, fields[i], item[i]);
          
          //map back to ids
          item[i] = keys.map(id => +id);
        }
      }
    });

    //add actual values
    mutable.addValues(draft, target, values);
  };

  //assumes old and rep and unique whitin themselves
  function removeDuplicates(draft: any, target: DataTypes, old: number[], rep: number[], uniqueIndex: number) {
    const objects = draft[target],
      deletedIds: number[] = [];

    console.log('old:', old.slice(), 'new:', rep);
  
    newList: for ( const newId of rep )
      for ( const oldId of old ) {
        console.log('comparing ids', newId, 'vs', oldId, objects[newId][uniqueIndex], objects[oldId][uniqueIndex]);
        if ( objects[newId][uniqueIndex] == objects[oldId][uniqueIndex] ) {
          deletedIds.push(oldId);
          //continue newList;
        }
      }
    
    console.log('deleted:', deletedIds);
    mutable.deleteIds(draft, target, deletedIds);
    return old.filter(id => !deletedIds.includes(id));
  }

  export function pushChildValues<K extends DataTypes>(draft: any, parent: DataTypes, parentId: number, child: K, values: Record<any>, uniqueBy?: keyof Interface<K>) {
    //Add children
    const ids = Object.keys(values).map(id => +id);
    mutable.addValues(draft, child, values);

    //add to parent
    const parentObject = draft[parent]?.[parentId],
      childIndex = draft.fields[parent].indexOf(child);
    if ( !parentObject || childIndex <= -1 ) return;

    if ( uniqueBy ) {
      console.log('will remove duplicates by', uniqueBy);
      const uniqueIndex = draft.fields[child].indexOf(uniqueBy);
      if ( uniqueIndex !== void 0 )
        parentObject[childIndex] = removeDuplicates(draft, child, parentObject[childIndex], ids, uniqueIndex);
    }

    parentObject[childIndex].push(...ids);
  }

  export function pushChildIds<K extends DataTypes>(draft: any, parent: DataTypes, parentId: number, child: K, ids: number[]) {
    const parentObject = draft[parent]?.[parentId],
      childIndex = draft.fields[parent].indexOf(child);
    if ( !parentObject || childIndex <= -1 ) return;

    parentObject[childIndex].push(...ids);
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

export function replace(target: DataTypes, values: any) {
  return produce(draft => mutable.replace(draft, target, values));
};

//maybe add a uniqueBy or check first
export function pushChildIds<K extends DataTypes>(parent: DataTypes, parentId: number, child: K, ids: number[]) {
  return produce(draft => mutable.pushChildIds(draft, parent, parentId, child, ids));
};
export function pushChildValues<K extends DataTypes>(parent: DataTypes, parentId: number, child: K, values: Record<any>, uniqueBy?: keyof Interface<K>) {
  return produce(draft => mutable.pushChildValues(draft, parent, parentId, child, values, uniqueBy));
};

export function transformField<K extends DataTypes, V extends keyof Interface<K>>(target: K, id: number, field: V, transform: (value: RepresentedType<K, V>, object: any[], fields: string[]) => RepresentedType<K, V>) {
  return produce(draft => mutable.transformField(draft, target, id, field, transform));
};