import Controller from '@ember/controller';
// import { computed } from '@ember/object';
// import { isEmpty } from '@ember/utils';
// import { A } from '@ember/array';

export default Controller.extend({
	// numberVerify: /^-?[1-9]\d*$/,
	// IndicatorAllocationPercent: computed('businessinput.salesTarget', function () {
	// 	let { totalBusinessIndicators, businessinput } =
	// 		this.getProperties('totalBusinessIndicators', 'businessinput'),
	// 		salesTarget = businessinput.get('salesTarget'),
	// 		verify = this.numberVerify,
	// 		illegal = verify.test(salesTarget);

	// 	if (!illegal && salesTarget !== '') {
	// 		return {
	// 			illegal: true,
	// 			percent: 0
	// 		};
	// 	}
	// 	return {
	// 		illegal: false,
	// 		percent: isEmpty(totalBusinessIndicators) ? 0 : (salesTarget * 100 / totalBusinessIndicators).toFixed(2)
	// 	};
	// }),
	// budgetPercent: computed('businessinput.budget', function () {
	// 	let { totalBudgets, businessinput } =
	// 		this.getProperties('totalBudgets', 'businessinput'),
	// 		budget = businessinput.get('budget'),
	// 		verify = this.numberVerify,
	// 		illegal = verify.test(budget);

	// 	if (!illegal && budget !== '') {
	// 		return {
	// 			illegal: true,
	// 			percent: 0
	// 		};
	// 	}
	// 	return {
	// 		illegal: false,
	// 		percent: isEmpty(totalBudgets) ? 0 : (budget * 100 / totalBudgets).toFixed(2)
	// 	};
	// }),

	actions: {
		changedRep(item) {
			let businessinput = this.get('businessinput');

			this.set('tmpRc', item);
			businessinput.setProperties({
				resourceConfigId: item.id,
				resourceConfig: item
			});
		},
		reInput() {
			let businessinput = this.get('businessinput'),
				goodsInputs = businessinput.get('goodsinputs');

			goodsInputs.forEach(goodsInput => {
				goodsInput.setProperties({
					salesTarget: '',	// 销售目标设定
					budget: ''
				});
			});

			this.set('tmpRc', null);

			businessinput.setProperties({
				resourceConfigId: '',
				resourceConfig: null
			});
		}
	}
});
