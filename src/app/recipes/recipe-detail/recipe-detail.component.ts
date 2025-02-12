import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IRecipe } from '../i-recipe';
import { SupabaseService } from '../../services/supabase.service';
import { IngredientComponent } from '../ingredient/ingredient.component';
import { Ingredient } from '../ingredient';

@Component({
  selector: 'app-recipe-detail',
  imports: [RouterLink, IngredientComponent],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.css'
})
export class RecipeDetailComponent implements OnInit{
  
  @Input('id') recipeID?: string; //Ixe recipe id es el que se mostrara en el .html
  public recipe: IRecipe | undefined;
  public ingredients: Ingredient[] = [];

  constructor(private supabaseService: SupabaseService){

  }

  ngOnInit(): void {
    this.supabaseService.getMeals(this.recipeID).subscribe({
      next: meals => {
        this.recipe = meals[0];
        this.supabaseService.getIngredients(this.recipe?.idIngredients).subscribe({
          next: ingredients => {
            this.ingredients.push(ingredients);
          }
        });
      },
      error: err => console.log(err),
      complete: ()=> console.log('Received')
    });
  }
}
