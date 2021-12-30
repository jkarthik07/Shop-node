const delProd = btn => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    // console.log(`${prodId} and ${csrf}`)

    const prodElement = btn.closest('article')

    fetch('/admin/product/'+ prodId,{
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
        .then(result=>{
            return result.json();
            // console.log(result)
        })
        .then(data=>{
            console.log(data);
            prodElement.parentNode.removeChild(prodElement)
        })
        .catch(err=>{
            console.log(err)
        })
}