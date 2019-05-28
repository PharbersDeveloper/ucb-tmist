import Service from '@ember/service';

export default Service.extend({
	// 数字验证规则
	numberVerify: /^\d+$/,
	verifyInput(businessInputs, resourceConfigManager) {
		let usedSalesTarget = 0,
			usedBudget = 0,
			numberVerify = this.get('numberVerify'),
			totalBusinessIndicators = resourceConfigManager.get('managerConfig.totalBusinessIndicators'),
			totalBudgets = resourceConfigManager.get('managerConfig.totalBudgets');

		businessInputs.forEach(bi => {
			usedSalesTarget += Number(bi.get('totalSalesTarget'));
			usedBudget += Number(bi.get('totalBudget'));
		});
		return {
			illegal: !numberVerify.test(usedSalesTarget) || !numberVerify.test(usedBudget),
			lowTotalBusinessIndicators: usedSalesTarget < totalBusinessIndicators,
			lowTotalBudgets: usedBudget < totalBudgets,
			overTotalBusinessIndicators: usedSalesTarget > totalBusinessIndicators,
			overTotalBudgets: usedBudget > totalBudgets,
			usedSalesTarget,
			usedBudget
		};
	}
});
