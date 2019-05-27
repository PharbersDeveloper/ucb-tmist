import Controller from '@ember/controller';
import { A } from '@ember/array';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Controller.extend({
	// 设置一些默认值
	indicatorValue: 0,
	budgetValue: 0,
	meetingValue: 0,
	hospitalState: A([
		{ name: '全部', state: 0 },
		{ name: '待分配', state: 1 },
		{ name: '已分配', state: 2 }

	]),
	// indicatorsData: computed('model.goodsConfigs', function () {
	// 	let goodsConfigs = this.get('model.goodsConfigs'),
	// 		goodsConfigsSelf = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0),
	// 		initData = goodsConfigsSelf.map(ele => {
	// 			return { value: 0, name: ele.get('productConfig.product.name') };
	// 		});

	// 	return A([{ seriesName: '', data: initData }
	// 	]);
	// }),
	indicatorsData: alias('total.indicatorsData'),
	budgetData: alias('total.budgetData'),

	overallFilterData: computed('currentHospState.state', 'businessInputs.@each.isFinish', function () {
		let currentHospState = this.get('currentHospState').state,
			destConfigs = this.get('model').destConfigs,
			businessInputs = this.get('businessInputs'),
			tmpDestConfigs = A([]);

		if (currentHospState) {
			let tmpBis = businessInputs.filterBy('isFinish', currentHospState !== 1);

			tmpBis.forEach(ele => {
				destConfigs.forEach(item => {
					if (ele.get('destConfigId') === item.id) {
						tmpDestConfigs.push(item);
					}
				});
			});
			return tmpDestConfigs;
		}
		return destConfigs;
	}),
	total: computed('businessInputs.@each.{total}', function () {
		const store = this.get('store');

		let businessInputs = this.get('businessInputs'),
			newBusinessInputs = businessInputs.filter(ele => ele.get('isNew')),
			usedSalesTarget = 0,
			usedBudget = 0,
			goodsConfigs = this.get('model.goodsConfigs'),
			selfGoodsConfigs = goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0),
			indicatorsData = A([]),
			budgetData = A([]);

		newBusinessInputs.forEach(bi => {
			usedSalesTarget += Number(bi.get('totalSalesTarget'));
			usedBudget += Number(bi.get('totalBudget'));
		});
		// console.log(selfGoodsConfigs);
		selfGoodsConfigs.forEach(goodsConfig => {
			let goodsConfigInput = store.peekAll('goodsConfigInput'),
				currentProductId = goodsConfig.get('productConfig.product.id'),
				singleGoodsConfigInputs = goodsConfigInput.filterBy('goodsConfig.productConfig.product.id', currentProductId),
				target = 0,
				budget = 0;

			singleGoodsConfigInputs.forEach(gci => {
				target += Number(gci.get('salesTarget'));
				budget += Number(gci.get('budget'));
			});
			indicatorsData.push({
				value: target,
				name: goodsConfig.get('productConfig.product.name')
			});
			budgetData.push({
				value: budget,
				name: goodsConfig.get('productConfig.product.name')
			});
			// return {
			// 	value: target,
			// 	name: goodsConfig.get('productConfig.product.name')
			// };
		});

		return {
			usedSalesTarget,
			usedBudget,
			indicatorsData: A([{ seriesName: '', data: indicatorsData }]),
			budgetData: A([{ seriesName: '', data: budgetData }])

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
