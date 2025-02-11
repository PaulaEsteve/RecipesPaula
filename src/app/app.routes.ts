import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MainComponent } from './components/main/main.component';
import { RecipeTableComponent } from './recipes/recipe-table/recipe-table.component';
import { RecipeDetailComponent } from './recipes/recipe-detail/recipe-detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CreateRecipeComponent } from './recipes/create-recipe/create-recipe.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'main', component: MainComponent},
    {path: 'table', component: RecipeTableComponent},
    {path: 'recipes/:id', component: RecipeDetailComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'create_recipe', component: CreateRecipeComponent},
    {path: 'edit_recipe/:id', component: CreateRecipeComponent},
    {path: '**', pathMatch: 'full', redirectTo: 'home'}
];
