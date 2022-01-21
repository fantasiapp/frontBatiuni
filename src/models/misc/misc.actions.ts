export class GetCompanies {
  static readonly type = '[Misc] Get Companies'
  action = 'getEnterpriseDataFrom';
  SIRET = ''; //for now
  constructor(public subname: string, public storeId: string) {}
};

export class Clear {
  static readonly type = '[Misc] Clear';
};