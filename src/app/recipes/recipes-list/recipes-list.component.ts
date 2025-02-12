import { Component, OnDestroy, OnInit } from '@angular/core';
import { IRecipe } from '../i-recipe';

import { recipes } from './recipes_exemples';
import { CommonModule } from '@angular/common';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { SupabaseService } from '../../services/supabase.service';
import { Subscription } from 'rxjs';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SearchServiceService } from '../../services/search-service.service';
import { FilterPipe } from '../../pipes/filter.pipe';

@Component({
  selector: 'app-recipes-list',
  imports: [CommonModule,RecipeCardComponent,RouterLink,FilterPipe], // commonModule -> para que funcione @for
  templateUrl: './recipes-list.component.html',
  styleUrl: './recipes-list.component.css'
})
export class RecipesListComponent implements OnInit,OnDestroy{
  
  constructor(private supabaseService: SupabaseService, private searchService: SearchServiceService){}

  public recipes: IRecipe[] = [];
  public allRecipes: IRecipe[] = [];
  public characters: any[] = [];
  private searchSubscription?: Subscription;
  public searchValue: string = '';
  
  ngOnInit(): void { //evento -> cuando el componente se inicializa

    //this.recipes = recipes; //inicializar datos, per a pasarlos desde el json
    //this.supabaseService.getRecipes();

    this.supabaseService.getMeals().subscribe({
      next: meals => {
       console.log(meals);
       this.recipes = meals;
       this.allRecipes = meals;
      },
      error: err => console.log(err),
      complete: ()=> console.log('Received')
    });

    this.searchSubscription = this.searchService.searchSubject.subscribe(searchValue => {
      this.searchValue = searchValue;
    });
  }

  ngOnDestroy(): void {
    // this.intervalSubscritor?.unsubscribe();
    this.searchSubscription?.unsubscribe();
   }

}
