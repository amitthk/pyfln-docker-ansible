import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { YamlreadComponent } from './yamlread/yamlread.component';
import { DashboardRoutesModule } from './dashboard-routes.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'app/services/http.service';
import { MindMapComponent } from './mind-map/mind-map.component';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutesModule,
    FormsModule,
    NgbModule ],
    declarations: [IndexComponent, YamlreadComponent, MindMapComponent],
  providers: [HttpService]
})
export class DashboardModule { }
