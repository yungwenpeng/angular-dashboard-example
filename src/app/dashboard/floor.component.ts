import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { EntityRelation } from '../models/asset';
import { FloorService } from '../services/floor.service';

@Component({
  selector: 'app-floor',
  templateUrl: './floor.component.html',
  styleUrls: ['./floor.component.css'],
  providers: [FloorService],
})
export class FloorComponent {
  fromId: string = "";
  rooms$: Subject<Array<EntityRelation>>;

  constructor(private FloorService: FloorService, private router: Router) {
    this.fromId = localStorage.getItem('floorAssetId') || '';
    console.log('FloorComponent: ', this.fromId);
    this.rooms$ = FloorService.rooms$;
  }
}
