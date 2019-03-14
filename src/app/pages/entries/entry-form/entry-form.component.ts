import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Entry  } from '../shared/entry.module';
import { EntryService } from '../shared/entry.service';

import { switchMap } from 'rxjs/operators';

import toastr from 'toastr';


@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean ;
  entry: Entry = new Entry();


  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  // metodo invocado depois de tudo carregado
  ngAfterContentChecked() {
    this.setPageTitle();

  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') { // new
      this.createEntry();
    } else { // edit
      this.updateEntry();
    }
  }

  // para ver qual a ação da tela
  private setCurrentAction() {
    // devolve um array contento toda a url
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  private loadEntry() {
    if (this.currentAction === 'edit')  {
      this.route.paramMap.pipe(
        switchMap( params => this.entryService.getById(+params.get('id')))
      ).subscribe(
        (entry) => {
          this.entry = entry;
          this.entryForm.patchValue(entry); // binds load entry data to EntryForm

        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
      );
    }
  }

  // setar o title da pagina
  private setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de Novo Lançamento';
    } else {
      const entryName = this.entry.name || '';
      this.pageTitle = 'Editando Lançamento: ' + entryName;
    }
  }

  private createEntry() {
    // criando uma Lançamento nova e adicionando os dados da entryForm
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.create(entry)
      .subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        entry => this.actionsForSuccess(entry),
        error => this.actionsFormError(error)
      );
  }

  private updateEntry() {
    // criando uma Lançamento nova e adicionando os dados da entryForm
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.update(entry)
      .subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        entry => this.actionsForSuccess(entry),
        error => this.actionsFormError(error)
     );

  }

  private actionsForSuccess(entry: Entry) {
    toastr.success('Solicitação processada com sucesso');
    // forçando o recarregamento
    this.router.navigateByUrl('entries', {skipLocationChange: true}).then(
      () => this.router.navigate(['entries', entry.id, 'edit'])
    );
  }

  private actionsFormError(error) {
    toastr.error('Ocorreu um erro ao processar a sua solicitação!');
    this.submittingForm = false;

    if (error.status === 422) {
      // retorna o erro do servidor
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      // geralmente falha na comunicação
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor tente mais tarde'];
    }
  }

}
