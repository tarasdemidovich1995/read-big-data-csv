import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DatabaseService } from './services/database.service';
import { DB_NAME, DB_VERSION, PEOPLE_STORE } from './constants/global';
import { PersonTableComponent } from './components/person-table/person-table.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    AppComponent,
    PersonTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    ScrollingModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: (db: DatabaseService) => db.initDB({
      name: DB_NAME,
      version: DB_VERSION,
      stores: [{
        name: PEOPLE_STORE,
        keyPath: 'index',
        indexes: [{
          key: 'userId',
          unique: true,
        }]
      }]
    }),
    deps: [DatabaseService]
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
