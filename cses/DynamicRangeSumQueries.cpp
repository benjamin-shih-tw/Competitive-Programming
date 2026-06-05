#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<ll,ll>
#define SZ(x) ((ll)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(ll i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(ll i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
ll n,q;
const ll mxn = 2e5+10;
ll arr[mxn];
struct BIT{
    ll bit[mxn];
    void modify(ll p,ll v){
        for(; p < mxn ; p += p&-p) bit[p] += v;
    }
    ll getval(ll p){
        ll re = 0;
        for(; p > 0 ; p -= p&-p) re += bit[p];
        return re;
    }       
}bit;
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    cin >> n >> q;
    foo(i,1,n){
        cin >> arr[i];
        bit.modify(i,arr[i]);
    }
    while(q--){
        ll t,a,b;
        cin >> t >> a >> b;
        if(t == 1){
            ll d = b-arr[a];
            bit.modify(a,d);
            arr[a] = b;
        }
        else{
            cout << bit.getval(b) - bit.getval(a-1) << '\n';
        }
    }
}