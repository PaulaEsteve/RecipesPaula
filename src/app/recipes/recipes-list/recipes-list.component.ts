import { Component, OnInit } from '@angular/core';
import { IRecipe } from '../i-recipe';

import { recipes } from './recipes_exemples';
import { CommonModule } from '@angular/common';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { SupabaseService } from '../../services/supabase.service';
import { Subscription } from 'rxjs';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-recipes-list',
  imports: [CommonModule,RecipeCardComponent,RouterLink,RouterLinkActive], // commonModule -> para que funcione @for
  templateUrl: './recipes-list.component.html',
  styleUrl: './recipes-list.component.css'
})
export class RecipesListComponent implements OnInit{
  
  constructor(private supabaseService: SupabaseService){}

  public recipes: IRecipe[] = [];
  public characters: any[] = [];
  
  ngOnInit(): void { //evento -> cuando el componente se inicializa
    //this.recipes = recipes; //inicializar datos, per a pasarlos desde el json
    //this.supabaseService.getRecipes();
    //console.log(this.supabaseService.getRecipes());
    this.supabaseService.getMeals().subscribe({
      next: meals => {
       console.log(meals);
       this.recipes = meals;
      },
      error: err => console.log(err),
      complete: ()=> console.log('Received')
    });
  }

}
