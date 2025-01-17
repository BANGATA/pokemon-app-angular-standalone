import { Component, ViewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonItem,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  IonCardContent,
  IonModal,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { MenuComponent } from '../menu/menu.component';
import { addIcons } from 'ionicons';
import { starSharp, starOutline } from 'ionicons/icons';
import { PokeApiService } from 'src/services/poke.service';
import { HelpersClass } from 'src/utils/helpers';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    MenuComponent,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonInput,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonBadge,
    IonCardContent,
    IonModal,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonMenuButton,
  ],
})
export class HomePage {
  constructor(
    private pokeApiService: PokeApiService,
    private helpers: HelpersClass
  ) {
    addIcons({ starSharp, starOutline });
    this.fetchPokemonTypes();
    this.loadMore();
  }
  @ViewChild(IonModal) modal!: IonModal;
  pokemons: any[] = [];
  filteredPokemons: any[] = [];
  offset = 0;
  limit = 20;
  hasMore = true;
  selectedType = 'all';
  allTypes: string[] = [];
  search: string = '';
  selectedPokemon: any = null;

  getTypeClass(type: string) {
    return this.helpers.getTypeClass(type);
  }

  async fetchPokemonTypes() {
    this.allTypes = await this.pokeApiService.loadPokemonTypes();
  }

  openModal(pokemon: any) {
    this.selectedPokemon = pokemon;
    this.modal.present();
  }

  dismissModal() {
    this.modal.dismiss();
    this.selectedPokemon = null;
  }

  getFavorites(): any[] {
    const fav = this.helpers.getLocalStorageFavorite();
    return fav ? JSON.parse(fav) : [];
  }

  saveFavorites(favorites: any[]) {
    localStorage.setItem('favoritePokemons', JSON.stringify(favorites));
  }

  toggleFavorite(pokemon: any) {
    this.selectedPokemon = pokemon;
    const favorites = this.getFavorites();
    const index = favorites.findIndex((fav: any) => fav.id === pokemon.id);
    if (index === -1) {
      favorites.push(pokemon);
      pokemon.isFavorite = true;
    } else {
      favorites.splice(index, 1);
      pokemon.isFavorite = false;
    }
    this.saveFavorites(favorites);
  }

  async loadMore(event?: any) {
    if (!this.hasMore) {
      if (event) event.target.complete();
      return;
    }

    try {
      const favorites = this.getFavorites();

      if (this.selectedType === 'all') {
        const data = await this.pokeApiService.fetchPokemon(
          this.offset,
          this.limit
        );

        for (const pokemon of data.results) {
          const details = await this.pokeApiService.fetchPokemonDetails(
            pokemon.url
          );

          const stats = details.stats.reduce((acc: any, statObj: any) => {
            const statName = statObj.stat.name.replace(/-/g, '');
            acc[statName] = statObj.base_stat;
            return acc;
          }, {});

          const isFavorite = favorites.some(
            (fav: any) => fav.id === details.id
          );

          this.pokemons.push({
            name: details.name,
            image: details.sprites.front_default,
            types: details.types
              .map(
                (t: any) =>
                  t.type.name.charAt(0).toUpperCase() + t.type.name.substr(1)
              )
              .join(' '),
            height: details.height,
            weight: details.weight,
            id: details.id,
            isFavorite,
            ...stats,
          });
        }

        this.offset += this.limit;

        if (this.pokemons.length >= data.count) {
          this.hasMore = false;
        }
      } else {
        const data = await this.pokeApiService.fetchPokemonByType(
          this.selectedType
        );

        for (const pokemon of data) {
          const details = await this.pokeApiService.fetchPokemonDetails(
            pokemon.url
          );

          const stats = details.stats.reduce((acc: any, statObj: any) => {
            const statName = statObj.stat.name.replace(/-/g, '');
            acc[statName] = statObj.base_stat;
            return acc;
          }, {});

          const isFavorite = favorites.some(
            (fav: any) => fav.id === details.id
          );

          this.filteredPokemons.push({
            name: details.name,
            image: details.sprites.front_default,
            types: details.types
              .map(
                (t: any) =>
                  t.type.name.charAt(0).toUpperCase() + t.type.name.substr(1)
              )
              .join(' '),
            height: details.height,
            weight: details.weight,
            id: details.id,
            isFavorite,
            ...stats,
          });
        }

        this.hasMore = false;
      }

      if (event) event.target.complete();
    } catch (error) {
      console.error('Error loading more Pokémon:', error);
      if (event) event.target.complete();
    }
  }

  onTypeChange(type: string) {
    this.selectedType = type;
    this.search = '';
    this.resetData();
    this.loadMore();
  }

  async handleSearchPokemon() {
    const favorites = this.getFavorites();
    if (this.search === '') {
      this.pokemons = [];
      const res = await this.pokeApiService.fetchPokemonByName(
        this.search.toLowerCase()
      );

      if (res) {
        for (const pokemon of res.results) {
          const details = await this.pokeApiService.fetchPokemonDetails(
            pokemon.url
          );

          const stats = details.stats.reduce((acc: any, statObj: any) => {
            const statName = statObj.stat.name.replace(/-/g, '');
            acc[statName] = statObj.base_stat;
            return acc;
          }, {});

          const isFavorite = favorites.some(
            (fav: any) => fav.id === details.id
          );

          this.pokemons.push({
            name: details.name,
            image: details.sprites.front_default,
            types: details.types
              .map(
                (t: any) =>
                  t.type.name.charAt(0).toUpperCase() + t.type.name.substr(1)
              )
              .join(' '),
            height: details.height,
            weight: details.weight,
            id: details.id,
            isFavorite,
            ...stats,
          });
        }
      }
    } else if (this.search !== '') {
      this.pokemons = [];
      const details = await this.pokeApiService.fetchPokemonByName(
        this.search.toLowerCase()
      );

      const stats = details.stats.reduce((acc: any, statObj: any) => {
        const statName = statObj.stat.name.replace(/-/g, '');
        acc[statName] = statObj.base_stat;
        return acc;
      }, {});

      const isFavorite = favorites.some((fav: any) => fav.id === details.id);
      if (details) {
        this.pokemons.push({
          name: details.name,
          image: details.sprites.front_default,
          types: details.types
            .map(
              (t: any) =>
                t.type.name.charAt(0).toUpperCase() + t.type.name.substr(1)
            )
            .join(' '),
          height: details.height,
          weight: details.weight,
          id: details.id,
          isFavorite,
          ...stats,
        });
      }
    }
  }

  handleChangeSearch(name: string) {
    this.search = name;
  }

  resetData() {
    this.pokemons = [];
    this.filteredPokemons = [];
    this.offset = 0;
    this.hasMore = true;
  }
}
