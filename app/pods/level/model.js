import DS from 'ember-data';

export default DS.Model.extend({
	code: DS.attr('number'),
	describe: DS.attr('string'),
	level: DS.attr('string'),
	image: DS.belongsTo()
});
