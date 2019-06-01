import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards';
import { AuthenticationService, AlertService } from './services';
import { Sbs3appService } from './services/sbs3app.service';
import { IndexComponent } from './modules/dashboard/index/index.component';

const routes: Routes = [
    { path: '', redirectTo: 'index', pathMatch: 'full' },
    { path: 'index', component: IndexComponent}];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule],
    providers: [AuthGuard, AuthenticationService, AlertService, Sbs3appService]
})
export class AppRoutingModule { }
