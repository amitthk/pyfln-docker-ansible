import { Component, OnInit } from '@angular/core';
import { HttpService } from 'app/services/http.service';
import { Registration } from 'app/models';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

 // It maintains list of Registrations
  registrations: Registration[];
  // It maintains registration Model
  regModel: Registration;
  // It maintains registration form display status. By default it will be false.
  showNew: Boolean = false;
  // It will be either 'Save' or 'Update' based on operation.
  submitType = 'Save';
  // It maintains Array of countries.
  countries: string[] = ['SG', 'HK', 'India', 'US', 'UK', 'UAE'];
  constructor(private httpService: HttpService) {
    }

  ngOnInit() {
      // Add default registration data.
      this.getAll();
  }

  // This method associate to New Button.
  onNew() {
    // Initiate new registration.
    this.regModel = new Registration();
    // Change submitType to 'Save'.
    this.submitType = 'Save';
    // display registration entry section.
    this.showNew = true;
  }

  // This method associate to Save Button.
  onSave() {
      // Push registration model object into registration list.
      console.log(this.regModel);
      this.regModel._id = null;
        this.httpService.post('/api/db/db/test', this.regModel )
        .map(response => response.json())
        .subscribe(rsp => {
          // this.registrations.push(rsp.json())
          this.regModel._id = rsp;
          this.registrations.push(this.regModel);
      });

    // Hide registration entry section.
    this.showNew = false;
  }

  onUpdate() {
      this.httpService.put('/api/db/db/test?_id='.concat(this.regModel._id.$oid), this.regModel )
      .map(response => response.json())
      .subscribe(rsp => {
        // this.registrations.push(rsp.json())
      this.regModel._id = rsp;
      // Update the existing properties values based on model.
      this.getAll();
    });

    // Hide registration entry section.
    this.showNew = false;
  }

  // This method associate to Edit Button.
  onEdit(index: Registration) {
    // Assign selected table row index.
    this.getOne(index._id);
    // Retrieve selected registration from list and assign to model.
    this.regModel = index;
    // Change submitType to Update.
    this.submitType = 'Update';
    // Display registration entry section.
    this.showNew = true;
  }

  // This method associate to Delete Button.
  onDelete(index: Registration) {
    // Delete the corresponding registration entry from the list.
    this.httpService.delete('/api/db/db/test?_id='.concat(index._id.$oid))
    .map(response => response.json())
    .subscribe(rsp => {
      // this.registrations.push(rsp.json())
     this.getAll();
  });
  }

  // This method associate toCancel Button.
  onCancel() {
    // Hide registration entry section.
    this.showNew = false;
  }

  // This method associate to Bootstrap dropdown selection change.
  onChangeCountry(country: string) {
    // Assign corresponding selected country to model.
    this.regModel.country = country;
  }

  getAll() {
    this.httpService.get('/api/db/db/test')
    .map(response => response.json())
    .subscribe(data => {
      this.registrations = data;
  },
  error => {
    console.log('ERROR');
  });
  }

  getOne(_id: any): void {
    this.httpService.get('/api/db/db/test?_id=' + _id.$oid)
    .map(response => response.json())
    .subscribe(data => {
      this.regModel = data[0];
  },
  error => {
    console.log('ERROR');
  });
  }
}
