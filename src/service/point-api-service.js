import ApiService from '../framework/api-service';
import { adaptToServer } from '../utils';

export default class PointApiService extends ApiService {

  get points() {
    return this._load({
      url: 'points'
    }).then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({
      url: 'destinations'
    }).then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({
      url: 'offers'
    }).then(ApiService.parseResponse);
  }

  async updatePoint(update) {
    const response = await this._load({
      url: `points/${update.id}`,
      method: 'PUT',
      body: JSON.stringify(adaptToServer(update)),
      headers: new Headers({
        'Content-Type' : 'application/json'
      })
    });

    return ApiService.parseResponse(response);
  }

  async addPoint(point) {
    const response = await this._load({
      url: 'points',
      method: 'POST',
      body: JSON.stringify(point),
      headers: new Headers({
        'Content-Type' : 'application/json'
      })
    });

    return ApiService.parseResponse(response);
  }

  async deletePoint(point) {
    await this._load({
      url: `points/${point.id}`,
      method: 'DELETE'
    });
  }

}
