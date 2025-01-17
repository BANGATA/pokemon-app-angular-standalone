import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
} from '@ionic/angular/standalone';
import { MenuComponent } from '../menu/menu.component';
import { HelpersClass } from 'src/utils/helpers';
import { addIcons } from 'ionicons';
import { starSharp, starOutline } from 'ionicons/icons';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonModal,
    IonButton,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    MenuComponent,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  ],
})
export class FavoritePage {
  pokemons: any[] = [];
  selectedPokemon: any = null;
  @ViewChild(IonModal) modal!: IonModal;
  constructor(private helpers: HelpersClass) {
    this.getFavorites();
    addIcons({ starSharp, starOutline });
  }
  getFavorites() {
    const fav = this.helpers.getLocalStorageFavorite();
    this.pokemons = fav ? JSON.parse(fav) : [];
  }

  toggleFavorite(pokemon: any): void {
    pokemon.isFavorite = false;
    this.pokemons = this.pokemons.filter((p) => p.isFavorite);
    localStorage.setItem('favoritePokemons', JSON.stringify(this.pokemons));
    this.dismissModal();
  }

  openModal(pokemon: any) {
    this.selectedPokemon = pokemon;
    this.modal.present();
  }

  dismissModal() {
    this.modal.dismiss();
    this.selectedPokemon = null;
  }

  getTypeClass(type: string) {
    return this.helpers.getTypeClass(type);
  }
}
