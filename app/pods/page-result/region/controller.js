import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	circlePie: A([0, 90]),
	handler: service('serviceResultHandler'),

	barLineData: computed('regionChooseCity.id', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 地区销售趋势图');
		}
		const { regionChooseCity, model } = this,
			{ formatCitySalesReports } = model,
			handler = this.handler;

		let findCityItemValue = isEmpty(regionChooseCity) ? regionChooseCity : regionChooseCity.get('id'),
			findCityItemKey = 'city.id';

		return handler.changeTrendData(model.barLineDataCity, formatCitySalesReports, findCityItemKey, findCityItemValue);
	})
});
