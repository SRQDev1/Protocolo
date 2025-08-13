import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { UploadComponent } from './upload/upload';
import { FormTitleComponent } from './form-title/form-title';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  imports: [HttpClientModule, UploadComponent, FormTitleComponent, MatSnackBarModule],
  exports: [HttpClientModule, UploadComponent, FormTitleComponent, MatSnackBarModule]
})
export class SharedModule {}
