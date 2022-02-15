export class GetCompanies {
  static readonly type = '[Misc] Get Companies'
  action = 'getEnterpriseDataFrom';
  constructor(public subName: string) {}
};