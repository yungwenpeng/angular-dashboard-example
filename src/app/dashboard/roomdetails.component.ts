import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Subject } from 'rxjs';
import { EntityAlarm, EntityRelation } from '../models/asset';
import { HighEventHistoryService } from '../services/higheventhistory.service';
import { RoomDetailsService } from '../services/roomdetails.service';

@Component({
  selector: 'app-roomdetails',
  templateUrl: './roomdetails.component.html',
  styleUrls: ['./roomdetails.component.css'],
  providers: [RoomDetailsService, HighEventHistoryService]
})

export class RoomdetailsComponent {
  floorAssetId: string = '';
  roomAssetId: string = '';
  roomAssetName: string = '';
  detailsImageUrl: string = '';
  roomDetails$: Subject<Array<EntityRelation>>;
  public lineChartType: ChartType = 'line';
  public lineChartOptions: ChartConfiguration['options'] = {
    animation: { duration: 0 },
    plugins: { legend: { position: 'top' } },
    elements: { point: { radius: 0 } }
  };
  isDisplayHistory: boolean = false;
  eventHistories$: Subject<Array<EntityAlarm>>;

  constructor(private router: Router, private RoomDetailsService: RoomDetailsService, private HighEventHistoryService: HighEventHistoryService) {
    this.floorAssetId = localStorage.getItem('floorAssetId') || '';
    this.roomAssetId = localStorage.getItem('roomAssetId') || '';
    this.roomAssetName = localStorage.getItem('roomAssetName') || '';
    this.detailsImageUrl = RoomDetailsService.detailsImageUrl;
    this.roomDetails$ = RoomDetailsService.roomDetails$;
    this.eventHistories$ = HighEventHistoryService.eventHistories$;
    console.log('RoomdetailsComponent floorAssetId:', this.floorAssetId, ', roomAssetId:', this.roomAssetId, ', roomAssetName:', this.roomAssetName);
    console.log('RoomdetailsComponent roomDetails$:', this.roomDetails$);
  }

  handleImageUpload(fileToUpload: any) {
    if (fileToUpload.target.files && fileToUpload.target.files[0]) {
      //console.log('handleImageUpload target.files', fileToUpload.target.files[0])
      this.RoomDetailsService.createImageFromBlob(fileToUpload.target.files[0]);
      this.RoomDetailsService.updateData();
      this.roomDetails$ = this.RoomDetailsService.roomDetails$;
    }
  }

  displayHighTemperatureEventHistory() {
    if (this.isDisplayHistory == true) {
      this.isDisplayHistory = false;
    } else {
      this.isDisplayHistory = true;
      this.HighEventHistoryService.updateData();
      this.eventHistories$ = this.HighEventHistoryService.eventHistories$;
    }
  }

}
