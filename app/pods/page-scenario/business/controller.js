import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	verify: service('service-verify'),
	hospitalState: A([
		{ name: '全部', state: 0 },
		{ name: '待分配', state: 1 },
		{ name: '已分配', state: 2 }
	]),
	indicatorsData: alias('total.indicatorsData'),
	budgetData: alias('total.budgetData'),
	overallFilterData: computed('currentHospState.state', 'businessInputs.@each.isFinish', function () {
		let currentHospState = this.get('currentHospState').state,
			destConfigHospitals = this.get('model').destConfigHospitals,
			businessInputs = this.get('businessInputs'),
			tmpDestConfigs = A([]);

		if (currentHospState) {
			let tmpBis = businessInputs.filterBy('isFinish', currentHospState !== 1);

			tmpBis.forEach(ele => {
				destConfigHospitals.forEach(item => {
					if (ele.get('destConfigId') === item.id) {
						tmpDestConfigs.push(item);
					}
				});
			});
			return tmpDestConfigs;
		}
		return destConfigHospitals;
	}),
	warning: computed('total.verify.{overTotalIndicators,overTotalBudgets,illegal}', function () {
		let { overTotalIndicators, overTotalBudgets, illegal } =
			this.get('total.verify'),
			warning = { open: false, title: '', detail: '' };

		switch (true) {
		case illegal:
			warning.open = true;
			warning.title = '非法值警告';
			warning.detail = '请输入数字！';
			return warning;
		case !isEmpty(overTotalIndicators):
			warning.open = true;
			warning.title = `业务指标超额`;
			warning.detail = `${overTotalIndicators.productName} 的销售额指标设定总值已超出业务总指标限制，请重新分配。`;
			return warning;
		case !isEmpty(overTotalBudgets):
			warning.open = true;
			warning.title = `预算超额`;
			warning.detail = `${overTotalBudgets.productName} 的预算设定总值已超出总预算限制，请重新分配。`;
			return warning;
		default:
			return warning;
		}
	}),
	total: computed('model.businessInputs.@each.{total}', function () {
		const { selfGoodsConfigs, managerGoodsConfigs, goodsInputs } = this.model;

		let verifyService = this.get('verify'),
			businessInputs = this.get('businessInputs'),
			indicatorsData = A([]),
			budgetData = A([]);

		selfGoodsConfigs.forEach(goodsConfig => {
			let currentProductId = goodsConfig.get('productConfig.product.id'),
				currentGoodsInputs = goodsInputs.filterBy('goodsConfig.productConfig.product.id', currentProductId),
				target = 0,
				budget = 0;

			currentGoodsInputs.forEach(gci => {
				target += Number(gci.get('salesTarget'));
				budget += Number(gci.get('budget'));
			});
			indicatorsData.push({
				value: target,
				priceType: goodsConfig.get('productConfig.priceType'),
				id: currentProductId,
				name: goodsConfig.get('productConfig.product.name')
			});
			budgetData.push({
				value: budget,
				priceType: goodsConfig.get('productConfig.priceType'),
				id: currentProductId,
				name: goodsConfig.get('productConfig.product.name')
			});
		});

		return {
			indicatorsData,
			budgetData,
			verify: verifyService.verifyInput(businessInputs, managerGoodsConfigs, goodsInputs)
		};
	}),
	init() {
		this._super(...arguments);
		this.set('currentHospState', {
			name: '全部', state: 0
		});

		this.set('circleSize', A([0, 100]));
	},
	actions: {
		goToHospital(id) {
			this.transitionToRoute('page-scenario.index.hospital-config', id);
		}
	}
});
