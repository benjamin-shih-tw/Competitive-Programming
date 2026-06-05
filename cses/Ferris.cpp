#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<int,int>
#define SZ(x) ((int)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(int i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(int i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    int n,x;
    cin >> n >> x;
    vector<int> v(n);
    fo(i,n) cin >> v[i];
    sort(ALL(v));
    int l = 0,r = n-1;
    int cnt = 0;
    while(l <= r){
        // too heavy
        if(v[l] + v[r] > x){
            cnt++;
            r--;
        }
        else{
            l++,r--;
            cnt++;
        }
    }
    cout << cnt;
}