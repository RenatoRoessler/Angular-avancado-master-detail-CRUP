import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Category  } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

import { switchMap } from 'rxjs/operators';

// import toastr from 'toastr';
import * as toastr from 'toastr';


@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean ;
  category: Category = new Category();


  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  // metodo invocado depois de tudo carregado
  ngAfterContentChecked() {
    this.setPageTitle();

  }

  submitForm() {
    this.submittingForm = true;
    if (this.currentAction === 'new') { // new
      this.createCategory();
    } else { // edit
      this.updateCategory();
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

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  private loadCategory() {
    if (this.currentAction === 'edit')  {
      this.route.paramMap.pipe(
        switchMap( params => this.categoryService.getById(+params.get('id')))
      ).subscribe(
        (category) => {
          this.category = category;
          this.categoryForm.patchValue(category); // binds load category data to CategoryForm

        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
      );
    }
  }

  // setar o title da pagina
  private setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de Nova Categoria';
    } else {
      const categoryName = this.category.name || '';
      this.pageTitle = 'Editando Categoria: ' + categoryName;
    }
  }

  private createCategory() {
    // criando uma categoria nova e adicionando os dados da categoryForm
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.create(category)
      .subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        category => this.actionsForSuccess(category),
        error => this.actionsFormError(error)
      );
  }

  private updateCategory() {
    // criando uma categoria nova e adicionando os dados da categoryForm
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.update(category)
      .subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        category => this.actionsForSuccess(category),
        error => this.actionsFormError(error)
     );

  }

  private actionsForSuccess(category: Category) {
    toastr.success('Solicitação processada com sucesso');
    // forçando o recarregamento
    this.router.navigateByUrl('categories', {skipLocationChange: true}).then(
      () => this.router.navigate(['categories', category.id, 'edit'])
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
