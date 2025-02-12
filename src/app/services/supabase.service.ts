import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, catchError, from, map, mergeMap, Observable, tap, throwError } from 'rxjs';
import { IRecipe } from '../recipes/i-recipe';
import { Ingredient } from '../recipes/ingredient';

@Injectable({ //permiteix que siga injectable en qualsevol component
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /*-----GET RECIPES-----*/

  async getData(table: string, search?: Object, ids?: string[], idField?: string): Promise<any[]> {
    let query = this.supabase.from(table).select('*'); //agafa la tabla de supabase
    if (search) { //si te parametros de busqueda anyadir a la query
      query = query?.match(search);
    }
    if (ids) { //si te un id espacific anyadir parametro de busqueda
      console.log(idField);

      query = query?.in(idField ? idField : 'id', ids);
    }
    const { data, error } = await query; //espera a la resposta
    if (error) { //si retorna error, llançalo
      console.error('Error fetching data:', error);
      throw error;
    }
    return data; //retorna una promesa de un array de anys 
  }

  getDataObservable<T>(table: string, search?: Object, ids?: string[], idField?: string): Observable<T[]> {
    //la funcio from converteix de promesa a observable
    return from(this.getData(table, search, ids, idField));
  }

  getMeals(search?: string): Observable<IRecipe[]> {//search parametro opcional (?)
    //meals --> nom de la tabla // si te parametro de busqueda retorna un objecte id:numId sino undefined
    return this.getDataObservable('meals', search ? { idMeal: search } : undefined);
    //retorna un observable de un array de IRecipe(interfaz recetas)
  }

  getIngredients(ids: (string | null)[]): Observable<Ingredient> {
    return this.getDataObservable<Ingredient>(
      'ingredients',
      undefined,
      ids.filter((id) => id !== null) as string[],
      'idIngredient'
    ).pipe(
      mergeMap((ingredients: Ingredient[]) => from(ingredients)),
      mergeMap(async (ingredient: Ingredient) => {
        const { data, error } = await this.supabase.storage
          .from('recipes')
          .download(`${ingredient.strStorageimg}?rand=${Math.random()}`);
        if (data) {
          ingredient.blobimg = URL.createObjectURL(data);
        }
        return ingredient;
      })
    );
  }

  getAllIngredients(): Observable<Ingredient[]> {
    return this.getDataObservable<Ingredient>('ingredients');
  }
  /*----- -----*/
  /*-----UPDATE RECIPES-----*/
  updateRecipes(idMeal: string,
    updates: Partial<IRecipe>,): Observable<IRecipe | null> {
    return from(
      this.supabase
        .from('meals')
        .update(updates)
        .eq('idMeal', idMeal)
        .select()
        .single(),
    ).pipe(
      map((response) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      }),
      catchError((error) => throwError(() => error)),
    );
  }
  /*----- -----*/
  /*-----CREATE RECIPES-----*/
  createRecipes(recipe: IRecipe): Observable<IRecipe | null> {
    return from(
      this.supabase
      .from('meals')
      .insert([recipe])
      .select()
      .single()
    ).pipe(
      map((response) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data;
      }),
      catchError((error) => throwError(() => error)),
    );
  }

  getLastRecipeId(): Observable<number> {
    return from(
      this.supabase
        .from('meals')
        .select('idMeal')
        .order('idMeal', { ascending: false })
        .limit(1)
    ).pipe(
      map((response) => {
        if (response.error) {
          throw new Error(response.error.message);
        }
        return response.data.length > 0 ? parseInt(response.data[0].idMeal, 10) || 0 : 0;
      }),
      catchError((error) => throwError(() => error))
    );
  }
  
  
  /*----- -----*/
  /*-----LOGIN-----*/
  login(email: string, password: string) {
    const loginResult = from(this.supabase.auth.signInWithPassword({
      email,
      password
    })).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data;
      }),
      tap(() => this.isLogged()) //accion secundaria para actualizar el estado de inicio de sesión
    );

    return loginResult;

  }

  loggedSubject = new BehaviorSubject(false);

  async isLogged() {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (user) {
      this.loggedSubject.next(true);
    }
    else
      this.loggedSubject.next(false);
  }

  /*-----LOGOUT-----*/
  logout() {
    const logoutResult = from(this.supabase.auth.signOut()).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
        return true; // Retorna `true` si el logout fue exitoso
      }),
      tap(() => this.isLogged()) // Actualiza el estado de inicio de sesión
    );

    return logoutResult;
  }

  /*----- -----*/
  /*-----REGISTRO-----*/
  register(email: string, password: string) {
    const registerResult = from(this.supabase.auth.signUp({
      email,
      password
    })).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data;
      }),
      tap(() => this.isLogged()));

    return registerResult;
  }
}
