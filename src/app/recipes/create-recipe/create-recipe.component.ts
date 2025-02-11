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
import { Ingredient } from '../ingredient';
import { toArray } from 'rxjs';

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
  ingredientsList: Ingredient[] = []; //lista de ingredientes disponibles

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

  loadIngredients() {
    this.supaService.getAllIngredients().subscribe({
      next: (ingredients) => {
        this.ingredientsList = ingredients;
        console.log(this.ingredientsList);
        
      },
      error: (err) => console.log('Error al cargar ingredientes:', err),
    });
  }
  
  ngOnInit(): void {
    this.rutaActiva = this.router.url;
  
    if (this.recipeID) {
      this.supaService.getMeals(this.recipeID).subscribe({
        next: (meals) => {
          this.mealForm.reset(meals[0]);
  
          const ingredientIds = meals[0].idIngredients;
          if (ingredientIds && ingredientIds.length) {
            // Limpiar la lista antes de agregar nuevos ingredientes
            this.ingredientsList = [];
  
            // Iterar sobre cada ID de ingrediente y hacer una llamada individual
            ingredientIds.forEach((id) => {
              if (id) {
                this.supaService.getIngredients([id]).subscribe({
                  next: (ingredient) => {
                    this.ingredientsList.push(ingredient); // Guardar ingrediente en la lista
                    (<FormArray>this.mealForm.get('ingredients')).push(
                      this.generateIngredientControl(id)
                    );
                  },
                  error: (err) => console.log('Error al obtener ingrediente:', err),
                });
              }
            });
          }
        },
        error: (err) => console.log(err),
        complete: () => console.log('Datos de la receta recibidos'),
      });
    } else {
      this.loadIngredients();
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
