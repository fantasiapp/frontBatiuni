export class GetGeneralData {
  static readonly type = '[Data] Get General data';
  action = 'getGeneralData';
};

export class StoreData {
  static readonly type = '[Data] Store';
  type: 'add' | 'delete' | 'modify' | 'load';
  target: number;
  constructor(public name: string, public row: any, changes: {type: 'add' | 'delete' | 'modify' | 'load'; id: number}) {
    this.type = changes.type;
    this.target = changes.id;
  }
};

export class DeleteData {
  static readonly type = '[Data] Delete';
  constructor(public name: string, public row: any) { }
}