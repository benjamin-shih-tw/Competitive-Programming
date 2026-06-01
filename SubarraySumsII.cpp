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
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    ll n,x;
    cin >> n >> x;
    vector<ll> v(n);
    map<ll,ll> mp; mp[0] = 1;
    ll sum = 0; ll ans = 0;
    fo(i,n){
        cin >> v[i];
        sum += v[i];
        ans += mp[sum - x];
        mp[sum]++;
    }
    cout << ans;
}