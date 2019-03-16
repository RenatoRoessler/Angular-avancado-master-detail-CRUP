import { Component, OnInit } from '@angular/core';

import { Entry } from '../shared/entry.module';
import { EntryService } from '../shared/entry.service';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  entries: Entry[] = [];

  constructor( private entryService: EntryService ) { }

  ngOnInit() {
    this.entryService.getAll().subscribe(
      entries => this.entries = entries.sort((a, b) => b.id - a.id),
      error => alert('Errp ap carregar a lista')
    );
  }


  deleteEntry(entry) {
    const mustDelete = confirm('Deseja Realmente Excluir esse item?');
    if ( mustDelete ) {
      this.entryService.delete(entry.id).subscribe(
        () => this.entries = this.entries.filter( element => element !== entry),
        () => alert('erro ao tentar excluir')
      );
    }
  }

}
