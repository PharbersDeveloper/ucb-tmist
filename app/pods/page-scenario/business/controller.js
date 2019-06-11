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
	warning: computed('total.verify.{overTotalBusinessIndicators,overTotalBudgets,illegal}', function () {
		let { overTotalBusinessIndicators, overTotalBudgets, illegal } =
			this.get('total.verify'),
			warning = { open: false, title: '', detail: '' };

		switch (true) {
		case illegal:
			warning.open = true;
			warning.title = '非法值警告';
			warning.detail = '请输入数字！';
			return warning;
		case overTotalBusinessIndicators:
			warning.open = true;
			warning.title = '总业务指标超额';
			warning.detail = '您的销售额指标设定总值已超出业务总指标限制，请重新分配。';
			return warning;
		case overTotalBudgets:
			warning.open = true;
			warning.title = '总预算超额';
			warning.detail = '您的预算设定总值已超出总预算限制，请重新分配。';
			return warning;
		default:
			return warning;
		}
	}),
	total: computed('model.businessInputs.@each.{total}', function () {
		const store = this.get('store'),
			model = this.model,
			selfGoodsConfigs = model.selfGoodsConfigs,
			resourceConfigManager = model.resourceConfigManager;

		let verifyService = this.get('verify'),
			businessInputs = this.get('businessInputs'),
			newBusinessInputs = businessInputs,
			usedSalesTarget = 0,
			usedBudget = 0,
			indicatorsData = A([]),
			budgetData = A([]);

		newBusinessInputs.forEach(bi => {
			usedSalesTarget += Number(bi.get('totalSalesTarget'));
			usedBudget += Number(bi.get('totalBudget'));
		});
		// console.log(selfGoodsConfigs);
		selfGoodsConfigs.forEach(goodsConfig => {
			let goodsInputs = store.peekAll('goodsinput'),
				currentProductId = goodsConfig.get('productConfig.product.id'),
				singleGoodsInputs = goodsInputs.filterBy('goodsConfig.productConfig.product.id', currentProductId),
				target = 0,
				budget = 0;
			// currentManagerGoodsConfig = resourceConfigManager.get('managerConfig.managerGoodsConfigs').findBy('goodsConfig.id', goodsConfig.id);

			// console.log(resourceConfigManager.get('managerConfig.managerGoodsConfigs'));
			// console.warn(currentManagerGoodsConfig.goodsSalesTarget);
			// console.warn(currentManagerGoodsConfig.goodsSalesBudgets);

			singleGoodsInputs.forEach(gci => {
				target += Number(gci.get('salesTarget'));
				budget += Number(gci.get('budget'));
			});
			indicatorsData.push({
				value: target,
				total: 1500000,
				id: goodsConfig.get('productConfig.product.id'),
				name: goodsConfig.get('productConfig.product.name')
			});
			budgetData.push({
				value: budget,
				total: 85000,
				id: goodsConfig.get('productConfig.product.id'),
				name: goodsConfig.get('productConfig.product.name')
			});
		});

		return {
			usedSalesTarget,
			usedBudget,
			// indicatorsData: A([{ seriesName: '', data: indicatorsData }]),
			indicatorsData,
			// budgetData: A([{ seriesName: '', data: budgetData }]),
			budgetData,
			verify: verifyService.verifyInput(businessInputs, resourceConfigManager)
		};
	}),
	findModelValue(model = {}, key) {
		if (isEmpty(model) || isEmpty(key)) {
			return 0;
		}

	},
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
