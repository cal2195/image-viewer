import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { TreeModule } from 'angular-tree-component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { FileTreeComponentComponent } from './file-tree-component/file-tree-component.component';
import { ThumbnailComponentComponent } from './thumbnail-component/thumbnail-component.component';
import { FilterPipePipe } from './filter-pipe.pipe';
import { TagFilterPipePipe } from './tag-filter-pipe.pipe';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    FileTreeComponentComponent,
    ThumbnailComponentComponent,
    FilterPipePipe,
    TagFilterPipePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TreeModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    VirtualScrollerModule
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
