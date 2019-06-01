import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';


export class ObjectId {
    $oid: any;
  }

export class Registration {
    constructor(
      public _id: ObjectId = null,
      public firstName: string = '',
      public lastName: string = '',
      public dob: NgbDateStruct = null,
      public email: string = '',
      public password: string = '',
      public country: string = 'Select country'
    ) {}
  }
