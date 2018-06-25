import {Injectable} from "@angular/core";
import { Action, Store } from "@ngrx/store";
import {Actions, Effect} from "@ngrx/effects";
import { RouterUtilsService } from "../../services/router-utils.service";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { State } from "../reducers/management.reducers";
import * as ManagementActions from "../actions/management.actions";
import * as fromManagement from "../reducers/management.reducers";
import { ManagementService } from "../../services/management.service";

import { Observable } from 'rxjs/internal/Observable';
import {
  catchError,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { of } from 'rxjs/internal/observable/of';
import { ManagementSetting } from "../../models/management-settings.model";
import swal from 'sweetalert2';

@Injectable()
export class ManagementEffects {
    
  @Effect()
  navigateToSettings: Observable<Action> = RouterUtilsService.handleNavigation(
    'settings',
    this.actions$,
    this.store.select('databases'),
    (r: ActivatedRouteSnapshot, state: State) => {      
      return of({
        type: ManagementActions.ROUTER_GET_SETTINGS,
      });
    },
  );
  
  @Effect()
  getSettings: Observable<Action> = this.actions$
    .ofType(ManagementActions.ROUTER_GET_SETTINGS)
    .pipe(
      switchMap((action: ManagementActions.GetSettingsrouterAction) => {
        return fromPromise(
          this.managementService.getSettings(),
        ).pipe(
          mergeMap((data: {data: ManagementSetting[]}) => {
            console.log(data);
            return [
              {
                type: ManagementActions.SERVICE_GET_SETTINGS_COMPLETE,
                payload: data.data,
              },
            ];
          }),
          catchError(error => {
            console.log(error);
            return [
              {
                type: ManagementActions.SERVICE_GET_SETTINGS_FAILED,
                payload: error.message,
              },
            ];
          }),
        );
      }),
    );
  
    @Effect()
    updateSettings: Observable<Action> = this.actions$
      .ofType(ManagementActions.PAGE_UPDATE_SETTINGS)
      .pipe(
        withLatestFrom(this.store.select('management')),
        switchMap(([action, state]: any[]) => {
          return fromPromise(
            this.managementService.updateSettings(state.settings),
          ).pipe(
            mergeMap((data: {data: ManagementSetting[]}) => {
              this.router.navigate(['/management', 'settings']);

              const toast = (swal as any).mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
              });
              toast({
                type: 'success',
                title: 'Settings saved'
              })
              return [
                {
                  type: ManagementActions.SERVICE_UPDATE_SETTINGS_COMPLETE,
                  payload: data.data,
                },
              ];
            }),
            catchError(error => {
              return [
                {
                  type: ManagementActions.SERVICE_UPDATE_SETTINGS_FAILED,
                  payload: error.message,
                },
              ];
            }),
          );
        }),
      );
      @Effect()
      runRepoDiscovery: Observable<Action> = this.actions$
        .ofType(ManagementActions.PAGE_RUN_REPO_DISCOVERY)
        .pipe(
          switchMap((action: ManagementActions.RunRepoDiscoveryPageAction) => {
            return fromPromise(
              this.managementService.runRepoDiscovery(),
            ).pipe(
              mergeMap((data: {data: ManagementSetting[]}) => {
                return [
                  {
                    type: ManagementActions.SERVICE_REPO_DISCOVERY_PROGRESS,
                    payload: {completion: 1, stepName: 'Initiated'},
                  },
                ];
              }),
              catchError(error => {
                return [
                  {
                    type: ManagementActions.SERVICE_REPO_DISCOVERY_FAILED,
                    payload: error.message,
                  },
                ];
              }),
            );
          }),
        );
      @Effect()
      repoDiscoveryProgress: Observable<Action> = this.actions$
        .ofType(ManagementActions.SERVICE_REPO_DISCOVERY_PROGRESS)
        .pipe(
          switchMap((action: ManagementActions.ServiceRunRepoDiscoveryProgressAction) => {
            const toast = (swal as any).mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
            toast({
              type: 'success',
              title: action.payload.stepName
            });
            return [
              {
                type: ManagementActions.MANAGEMENT_NOTHING
              },
            ];
          }),
        );
      @Effect()
      repoDiscoveryComplete: Observable<Action> = this.actions$
        .ofType(ManagementActions.SERVICE_REPO_DISCOVERY_COMPLETE)
        .pipe(
          switchMap((action: ManagementActions.ServiceRunRepoDiscoveryCompleteAction) => {
            const toast = (swal as any).mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
            toast({
              type: 'success',
              title: 'Complete'
            });
            return [
              {
                type: ManagementActions.MANAGEMENT_NOTHING
              },
            ];
          }),
        );



  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store<fromManagement.FeatureState>,
    private managementService: ManagementService) {
  }
}