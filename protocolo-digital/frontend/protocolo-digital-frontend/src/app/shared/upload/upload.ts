import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.html',
  styleUrl: './upload.scss'
})
export class UploadComponent {
  @Output() filesChange = new EventEmitter<File[]>();
  files: File[] = [];
  dragging = false;

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    if (!event.dataTransfer) return;
    this.addFiles(event.dataTransfer.files);
  }

  addFiles(list: FileList | null) {
    if (!list) return;
    for (let i = 0; i < list.length; i++) {
      const file = list.item(i);
      if (file && /pdf|png|jpe?g/.test(file.type) && file.size <= 10 * 1024 * 1024) {
        this.files.push(file);
      }
    }
    this.filesChange.emit(this.files);
  }
}
