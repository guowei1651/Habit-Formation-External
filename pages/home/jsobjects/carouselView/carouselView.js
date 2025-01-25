export default {
	currentIndex: 0,
	CarouselItem: [],
	displayCarousel () {
		if (this.currentIndex >= this.CarouselItem.length) {
			this.currentIndex = 0
		}
		console.log("")

		var currentItem = this.CarouselItem[this.currentIndex]
		var self = this
		setTimeout(()=>self.displayCarousel(), currentItem.duration*1000)

		Image.setImage(currentItem.chart_url)
		this.currentIndex ++
	},
	onload () {
		console.log("url query params:", appsmith.URL.queryParams)
		var carouselId = appsmith.URL.queryParams['carouselId']
		if (!carouselId){
			carouselId = 1
		}
		var self = this
		var param = {'id':carouselId}
		findCarouselItemByCarouseId.run(param).then((data) => {
			console.log(data)
			self.CarouselItem = data
			self.displayCarousel()
		}, (err) => {
			console.log("加载轮播失败", JSON.stringify(err))
			showAlert("加载轮播失败" + JSON.stringify(err),"warning")
		}).catch((err) => {
			console.log("加载轮播发生错误", JSON.stringify(err))
			showAlert("加载轮播发生错误" + JSON.stringify(err),"warning")
		})
	}
}