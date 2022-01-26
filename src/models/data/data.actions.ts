export class GetGeneralData {
  static readonly type = '[Data] Get General data';
  action = 'getGeneralData';
};

export class DeletePost {
  static readonly type = '[Data] Delete Post';
  action = 'deletePost';
  constructor(public id: number) { }
};