import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards';
import { AuthenticationService, AlertService } from '../../services';
import { Sbs3appService } from '../../services/sbs3app.service';
import { IndexComponent } from './index/index.component';
import { MindMapComponent } from './mind-map/mind-map.component';
import { YamlreadComponent } from './yamlread/yamlread.component';

const routes: Routes = [
    { path: '', redirectTo: 'index', pathMatch: 'full' },
    { path: 'index', component: IndexComponent},
    { path: 'mind-map', component: MindMapComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule],
    providers: [AuthGuard, AuthenticationService, AlertService, Sbs3appService]
})
export class DashboardRoutesModule { }
