import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	circlePie: A([0, 90]),
	handler: service('serviceResultHandler'),
	barLineData: computed('repChooseRep', 'repChooseGoods', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 代表销售趋势图');
		}
		let { repChooseRep, repChooseGoods, model } = this,
			{ formatRepresentativeSalesReports } = model,
			handler = this.handler,
			findRepItemValue = isEmpty(repChooseRep) ? repChooseRep : repChooseRep.get('representativeConfig.representative.id'),
			findRepItemKey = 'representative.id';

		return handler.changeTrendData(model.barLineDataRep, formatRepresentativeSalesReports, findRepItemKey, findRepItemValue);
	})
});
