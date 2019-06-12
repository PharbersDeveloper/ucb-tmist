import Service from '@ember/service';
import EmberObject from '@ember/object';

export default Service.extend({
	// 数字验证规则
	numberVerify: /^\d+$/,
	verifyInput(businessInputs, managerGoodsConfigs, goodsInputs) {
		let usedSalesTarget = 0,
			usedBudget = 0,
			numberVerify = this.get('numberVerify'),
			productUsedResources = managerGoodsConfigs.map(ele => {
				let currentProductId = ele.get('goodsConfig.productConfig.product.id'),
					currentInputs = goodsInputs.filterBy('goodsConfig.productConfig.product.id', currentProductId),
					usedSalesTarget = currentInputs.reduce((acc, cur) => acc + Number(cur.salesTarget), 0),
					usedBudget = currentInputs.reduce((acc, cur) => acc + Number(cur.budget), 0);

				return {
					totalSalesTarget: ele.goodsSalesTarget,
					totalBudget: ele.goodsSalesBudgets,
					goodsConfig: ele,
					productName: ele.get('goodsConfig.productConfig.product.name'),
					productId: ele.get('goodsConfig.productConfig.product.id'),
					usedSalesTarget,
					usedBudget
				}
			}),
			illegalProduct = EmberObject.create({
				title: '',
				detail: '',
				data: null
			});

		productUsedResources.forEach(ele => {
			switch (true) {
				case ele.usedSalesTarget < ele.totalSalesTarget:
					illegalProduct.setProperties({
						title: '指标设定未达标',
						detail: `药品 ${ele.productName} 的业务销售额指标尚未完成，请完成总业务指标。`,
						data: ele
					});
					break;
				case ele.usedBudget < ele.totalBudget:
					illegalProduct.setProperties({
						title: '预算设定未达标',
						detail: `药品 ${ele.productName} 还有总预算剩余，请分配完毕。`,
						data: ele
					});
					break;
				case ele.usedSalesTarget > ele.totalSalesTarget:
					illegalProduct.setProperties({
						title: '指标设定超额',
						detail: `药品 ${ele.productName} 的销售额指标设定值已超出业务总指标限制，请重新分配。`,
						data: ele
					});
					break;
				case ele.usedBudget > ele.totalBudget:
					illegalProduct.setProperties({
						title: '预算设定超额',
						detail: `药品 ${ele.productName} 的预算设定总值已超出总预算限制，请重新分配。`,
						data: ele
					});
					break;
			}

		})
		return {
			illegal: !productUsedResources.every(ele => numberVerify.test(ele.usedSalesTarget) && numberVerify.test(ele.usedBudget)),
			illegalProduct,
			lowTotalIndicators: productUsedResources.find(ele => ele.usedSalesTarget < ele.totalSalesTarget), // 返回指标小于预设指标的第一个药品（object/undefined）
			lowTotalBudgets: productUsedResources.find(ele => ele.usedBudget < ele.totalBudget), // 返回预算小于预设预算的第一个药品（object/undefined）,
			overTotalIndicators: productUsedResources.find(ele => ele.usedSalesTarget > ele.totalSalesTarget), // 返回指标小于预设指标的第一个药品（object/undefined）,
			overTotalBudgets: productUsedResources.find(ele => ele.usedBudget > ele.totalBudget),
			usedSalesTarget,
			usedBudget
		};
	}
});
