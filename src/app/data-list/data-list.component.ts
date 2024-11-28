import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';  
import { FileService } from '../file.service'; 
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';  

@Component({
  selector: 'app-data-list',
  standalone: true,  
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.css'],
})
export class DataListComponent implements AfterViewInit, OnInit {
  fileSelected = false;  
  selectedFile: File | null = null;
  displayedColumns: string[] = ['id', 'postId', 'name', 'email', 'body'];
  dataSource = new MatTableDataSource<any>([]); 

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | null = null;

  constructor(private fileService: FileService, private router: Router) { }

  ngOnInit(): void {
    this.fetchFileData();
  }

  fetchFileData(): void {
    this.fileService.getFileData().subscribe(
      (data: { id: number, postId: string, name: string,email: string, body: string }[]) => {  
        this.dataSource.data = data;
      },
      (error: any) => {
        console.error('Error fetching file data', error);
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }


  pageChanged(event: any): void {
    console.log('Page changed', event);
  }

  onFileChange(event: any): void {
    console.log("File Seleeeeeeee")
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileSelected = true;  
    }
  }

  onSubmit(): void {
    if (this.selectedFile) {
      // Check if the file is a CSV file
      const fileExtension = this.selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'csv') {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please upload a CSV file.',
        });
        return;
      }
  
      console.log("this.selectedFile", this.selectedFile);
      const formData = new FormData();
      formData.append('csvFile', this.selectedFile, this.selectedFile.name);
      console.log("formData", formData);
  
      this.fileService.uploadFile(formData).subscribe(
        (response: any) => {
          console.log('File uploaded successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'File Uploaded Successfully!',
            text: 'Your file has been uploaded.',
          }).then(() => {
            window.location.reload();
          });
        },
        (error: any) => {
          console.error('Error uploading file:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error Uploading File',
            text: 'There was an issue with your file upload. Please try again.',
          });
        }
      );
    } else {
      console.error('No file selected');
      Swal.fire({
        text: 'No file selected',
      });
    }
  }
}
