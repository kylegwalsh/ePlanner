(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

chrome.storage.sync.get('info', function(keys){    
    persistentInformation = keys.info;
    if(persistentInformation == null){
    	return;
    }
	ga('create', 'UA-96121250-1', {'userId': persistentInformation.UID});  // Replace with your property ID.
	ga('set', 'checkProtocolTask', null);
	ga('require', 'displayfeatures');
	ga('send', 'pageview', '/popup.html');
});