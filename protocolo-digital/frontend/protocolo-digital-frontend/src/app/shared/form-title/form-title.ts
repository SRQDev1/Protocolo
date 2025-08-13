import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-form-title',
  standalone: true,
  imports: [CommonModule, MatDividerModule],
  templateUrl: './form-title.html',
  styleUrl: './form-title.scss'
})
export class FormTitleComponent {
  @Input() title = '';
  @Input() description = '';
}
