import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-recipe',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './create-recipe.component.html',
  styleUrl: './create-recipe.component.css'
})
export class CreateRecipeComponent implements OnInit{
  @Input('id') recipeID?: string; //id de receta recibido desde el componente padre ( opcional )
  mealForm: FormGroup; //declara el formulario reactivo
  rutaActiva: string ='';

  constructor(
    private supaService: SupabaseService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    //define un formulario con (nombre del plato, instrucciones, array ingredientes vacio)
    this.mealForm = this.formBuilder.group({ 
      strMeal: ['', [Validators.required]],
      strInstructions: ['', [Validators.required]],
      ingredients: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.rutaActiva = this.router.url;
    
    if (this.recipeID) { //si recipeID existe
      // falta demanar tots els ingredients (id, nom)
      this.supaService.getMeals(this.recipeID).subscribe({ //obtiene los datos de la receta
        next: (meals) => {
          this.mealForm.reset(meals[0]); //rellena el formulario con los datos de la receta obtenida
          //itera sobre la lista de ingredientes
          meals[0].idIngredients.forEach(i=>{
            if(i){//si el ingrediente tiene un valor valido
              //nuevo input para el ingrediente
              (<FormArray>this.mealForm.get('ingredients')).push(
                this.generateIngredientControl(i)
             )
            }
          })
        },
        error: (err) => console.log(err),
        complete: () => console.log('Received'),
      });
    }
  }

  get strMealValid() { //validacion de strMeal
    return (
      this.mealForm.get('strMeal')?.valid &&
      this.mealForm.get('strMeal')?.touched
    );
  }

  getIngredientControl(): FormControl { //crea un campo de ingrediente vacío y obligatorio
    const control = this.formBuilder.control('');
    control.setValidators(Validators.required);
    return control;
  }

  generateIngredientControl(id: string): FormControl {
    //crea un campo de ingrediente con un valor preexistente
    const control = this.formBuilder.control(id);
    control.setValidators(Validators.required);
    return control;
  }

  get IngredientsArray(): FormArray { //devuelve el formArray de ingredientes
    return <FormArray>this.mealForm.get('ingredients');
  }

  addIngredient() { //añade nuevo campo de ingrediente al formulario
    (<FormArray>this.mealForm.get('ingredients')).push(
      this.getIngredientControl()
    );
  }

  delIngredient(i: number) {   //elimina un campo ingrediente del formulario
    (<FormArray>this.mealForm.get('ingredients')).removeAt(i);
  }
}
